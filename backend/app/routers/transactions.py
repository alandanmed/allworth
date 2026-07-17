import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Account, Transaction, User
from app.schemas.transaction import TransactionOut

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionOut])
def list_transactions(
    search: str | None = Query(default=None, description="Filter by merchant name, case-insensitive"),
    category: str | None = Query(default=None, description="Filter by exact category name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Transaction]:
    query = (
        db.query(Transaction)
        .join(Account)
        .filter(Account.user_id == current_user.id)
        .options(joinedload(Transaction.category))
    )

    if search:
        query = query.filter(Transaction.merchant.ilike(f"%{search}%"))

    if category:
        query = query.join(Transaction.category).filter(Transaction.category.has(name=category))

    return query.order_by(Transaction.date.desc()).all()


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Transaction:
    transaction = (
        db.query(Transaction)
        .join(Account)
        .filter(Transaction.id == transaction_id, Account.user_id == current_user.id)
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction
