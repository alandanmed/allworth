from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.products import Products
from plaid.model.sandbox_public_token_create_request import SandboxPublicTokenCreateRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
import time
from plaid.exceptions import ApiException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Account, BankConnection, Category, Institution, Transaction, User
from app.plaid_client import plaid_client
from app.schemas.plaid import BankConnectionOut, ConnectSandboxBankRequest, SyncResultOut
from app.utils.encryption import decrypt_token, encrypt_token

router = APIRouter(prefix="/plaid", tags=["plaid"])

# Plaid Sandbox account types map onto our own account.type values.
_PLAID_TYPE_MAP = {
    ("depository", "checking"): "checking",
    ("depository", "savings"): "savings",
    ("credit", "credit card"): "credit_card",
    ("investment", None): "investment",
    ("loan", None): "loan",
}


def _map_account_type(plaid_type: str, plaid_subtype: str | None) -> str:
    return _PLAID_TYPE_MAP.get((plaid_type, plaid_subtype)) or _PLAID_TYPE_MAP.get((plaid_type, None)) or "checking"


def _get_or_create_category(db: Session, name: str) -> Category:
    category = db.query(Category).filter(Category.name == name).first()
    if not category:
        category = Category(name=name)
        db.add(category)
        db.flush()
    return category


@router.post("/connect-sandbox", response_model=BankConnectionOut)
def connect_sandbox_bank(
    payload: ConnectSandboxBankRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BankConnectionOut:
    """
    Simulates what Plaid Link would normally do on the client: creates a
    Sandbox test public_token directly via Plaid's own testing endpoint
    (no Link UI needed), then exchanges it for a real access_token exactly
    like a production flow would.
    """
    existing_institution = db.query(Institution).filter(Institution.name == payload.institution_name).first()
    if existing_institution:
        existing_connection = (
            db.query(BankConnection)
            .filter(
                BankConnection.user_id == current_user.id,
                BankConnection.institution_id == existing_institution.id,
                BankConnection.status == "active",
            )
            .first()
        )
        if existing_connection:
            raise HTTPException(
                status_code=409,
                detail=f"{payload.institution_name} is already connected. Disconnect it first to reconnect.",
            )

    sandbox_response = plaid_client.sandbox_public_token_create(
        SandboxPublicTokenCreateRequest(
            institution_id=payload.institution_id,
            initial_products=[Products('transactions')],
        )
    )
    public_token = sandbox_response.public_token

    exchange_response = plaid_client.item_public_token_exchange(
        ItemPublicTokenExchangeRequest(public_token=public_token)
    )
    access_token = exchange_response.access_token
    item_id = exchange_response.item_id

    institution = db.query(Institution).filter(Institution.name == payload.institution_name).first()
    if not institution:
        institution = Institution(name=payload.institution_name, logo_color="#6366F1")
        db.add(institution)
        db.flush()

    connection = BankConnection(
        user_id=current_user.id,
        institution_id=institution.id,
        plaid_item_id=item_id,
        encrypted_access_token=encrypt_token(access_token),
        status="active",
    )
    db.add(connection)
    db.commit()
    db.refresh(connection)

    result = _sync_connection(db, connection)

    return BankConnectionOut(
        id=connection.id,
        institution_name=institution.name,
        status=connection.status,
        accounts_synced=result.accounts_synced,
    )


def _sync_connection(db: Session, connection: BankConnection) -> SyncResultOut:
    access_token = decrypt_token(connection.encrypted_access_token)

    # --- Sync accounts ---
    accounts_response = plaid_client.accounts_get(AccountsGetRequest(access_token=access_token))
    accounts_synced = 0

    account_id_map: dict[str, Account] = {}
    for plaid_account in accounts_response.accounts:
        existing = db.query(Account).filter(Account.plaid_account_id == plaid_account.account_id).first()
        account_type = _map_account_type(
            plaid_account.type.value if hasattr(plaid_account.type, "value") else str(plaid_account.type),
            plaid_account.subtype.value if plaid_account.subtype and hasattr(plaid_account.subtype, "value") else None,
        )
        is_liability = account_type in ("credit_card", "loan")
        raw_balance = plaid_account.balances.current or 0
        # Our balance convention is always positive; Plaid's credit/loan
        # balances are already positive-as-owed, so no sign flip needed there.
        balance = Decimal(str(abs(raw_balance)))

        if existing:
            existing.balance = balance
            existing.sync_status = "connected"
            account_id_map[plaid_account.account_id] = existing
        else:
            new_account = Account(
                user_id=connection.user_id,
                institution_id=connection.institution_id,
                bank_connection_id=connection.id,
                plaid_account_id=plaid_account.account_id,
                name=plaid_account.name,
                type=account_type,
                balance=balance,
                last_four_digits=plaid_account.mask or "0000",
                sync_status="connected",
            )
            db.add(new_account)
            db.flush()
            account_id_map[plaid_account.account_id] = new_account
        accounts_synced += 1

    # --- Sync transactions (last 90 days, Sandbox has limited history anyway) ---
    # Plaid processes transaction data asynchronously after an Item is
    # created, even in Sandbox — PRODUCT_NOT_READY is expected right after
    # a fresh connection, not an error condition. Retry briefly instead of
    # failing the whole sync.
    start_date = date.today() - timedelta(days=90)
    transactions_request = TransactionsGetRequest(
        access_token=access_token,
        start_date=start_date,
        end_date=date.today(),
        options=TransactionsGetRequestOptions(count=250),
    )

    max_retries = 4
    retry_delay_seconds = 2
    transactions_response = None

    for attempt in range(max_retries):
        try:
            transactions_response = plaid_client.transactions_get(transactions_request)
            break
        except ApiException as e:
            if "PRODUCT_NOT_READY" in str(e) and attempt < max_retries - 1:
                time.sleep(retry_delay_seconds)
                continue
            raise

    if transactions_response is None:
        transactions_response = plaid_client.transactions_get(transactions_request)

    transactions_added = 0
    transactions_skipped = 0

    for plaid_txn in transactions_response.transactions:
        existing_txn = (
            db.query(Transaction).filter(Transaction.plaid_transaction_id == plaid_txn.transaction_id).first()
        )
        if existing_txn:
            # Plaid transactions can transition from pending to completed
            # over time with the same transaction_id — update status
            # instead of silently treating this as an untouched duplicate.
            new_status = 'pending' if plaid_txn.pending else 'completed'
            if existing_txn.status != new_status:
                existing_txn.status = new_status
            transactions_skipped += 1
            continue

        account = account_id_map.get(plaid_txn.account_id)
        if not account:
            continue

        category_name = (plaid_txn.personal_finance_category.primary if plaid_txn.personal_finance_category else "Uncategorized")
        category = _get_or_create_category(db, category_name.replace("_", " ").title())

        db.add(Transaction(
            account_id=account.id,
            category_id=category.id,
            merchant=plaid_txn.merchant_name or plaid_txn.name,
            amount=Decimal(str(plaid_txn.amount)),
            date=plaid_txn.date,
            status="pending" if plaid_txn.pending else "completed",
            plaid_transaction_id=plaid_txn.transaction_id,
        ))
        transactions_added += 1

    db.commit()

    return SyncResultOut(
        accounts_synced=accounts_synced,
        transactions_added=transactions_added,
        transactions_skipped_duplicate=transactions_skipped,
    )


@router.post("/connections/{connection_id}/sync", response_model=SyncResultOut)
def sync_connection(
    connection_id,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SyncResultOut:
    connection = (
        db.query(BankConnection)
        .filter(BankConnection.id == connection_id, BankConnection.user_id == current_user.id)
        .first()
    )
    if not connection:
        raise HTTPException(status_code=404, detail="Bank connection not found")
    if connection.status != "active":
        raise HTTPException(status_code=400, detail=f"Connection is {connection.status}, cannot sync")

    return _sync_connection(db, connection)


@router.get("/connections", response_model=list[BankConnectionOut])
def list_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BankConnectionOut]:
    connections = db.query(BankConnection).filter(BankConnection.user_id == current_user.id).all()
    results = []
    for c in connections:
        account_count = db.query(Account).filter(Account.bank_connection_id == c.id).count()
        results.append(BankConnectionOut(
            id=c.id, institution_name=c.institution.name, status=c.status, accounts_synced=account_count
        ))
    return results


@router.delete("/connections/{connection_id}", status_code=204)
def disconnect_bank(
    connection_id,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    connection = (
        db.query(BankConnection)
        .filter(BankConnection.id == connection_id, BankConnection.user_id == current_user.id)
        .first()
    )
    if not connection:
        raise HTTPException(status_code=404, detail="Bank connection not found")

    # Soft-disconnect rather than hard delete: preserves transaction history
    # instead of cascading straight to permanent data loss. A real "remove
    # everything" action could still be offered separately if wanted.
    connection.status = "disconnected"
    for account in db.query(Account).filter(Account.bank_connection_id == connection.id).all():
        account.sync_status = "disconnected"
    db.commit()
