from datetime import date
from decimal import Decimal

from app.ai.tools import (
    find_large_transactions,
    get_account_balances,
    get_net_worth,
    get_recent_transactions,
    get_spending_by_category,
)
from app.models import Account, Category, Institution, Transaction, User


def _setup_user_with_data(db_session):
    user = User(firebase_uid="tool-uid", email="tool@example.com")
    institution = Institution(name="Test Bank")
    db_session.add_all([user, institution])
    db_session.flush()

    checking = Account(
        user_id=user.id, institution_id=institution.id, name="Checking",
        type="checking", balance=Decimal("1000.00"), last_four_digits="1111", sync_status="manual",
    )
    credit = Account(
        user_id=user.id, institution_id=institution.id, name="Credit Card",
        type="credit_card", balance=Decimal("200.00"), last_four_digits="2222", sync_status="manual",
    )
    db_session.add_all([checking, credit])
    db_session.flush()

    groceries = Category(name="Groceries")
    db_session.add(groceries)
    db_session.flush()

    today = date.today()
    db_session.add_all([
        Transaction(account_id=checking.id, category_id=groceries.id, merchant="Store A",
                    amount=Decimal("50.00"), date=today, status="completed"),
        Transaction(account_id=checking.id, category_id=groceries.id, merchant="Store B",
                    amount=Decimal("300.00"), date=today, status="completed"),
    ])
    db_session.commit()

    return user, checking, credit


def test_get_net_worth_computes_assets_minus_liabilities(db_session):
    user, checking, credit = _setup_user_with_data(db_session)
    result = get_net_worth(db_session, user.id)
    assert result["total_assets"] == 1000.00
    assert result["total_liabilities"] == 200.00
    assert result["net_worth"] == 800.00


def test_get_account_balances_returns_only_own_accounts(db_session):
    user, checking, credit = _setup_user_with_data(db_session)
    result = get_account_balances(db_session, user.id)
    names = {a["name"] for a in result["accounts"]}
    assert names == {"Checking", "Credit Card"}


def test_get_recent_transactions_respects_hard_limit_cap(db_session):
    user, checking, credit = _setup_user_with_data(db_session)
    # Request an absurd limit — should be clamped, not passed through raw.
    result = get_recent_transactions(db_session, user.id, limit=99999)
    assert len(result["transactions"]) <= 50


def test_find_large_transactions_excludes_income(db_session):
    user, checking, credit = _setup_user_with_data(db_session)
    today = date.today()
    db_session.add(Transaction(
        account_id=checking.id, merchant="Payroll", amount=Decimal("-5000.00"),
        date=today, status="completed",
    ))
    db_session.commit()

    result = find_large_transactions(db_session, user.id, limit=5)
    merchants = [t["merchant"] for t in result["transactions"]]
    assert "Payroll" not in merchants


def test_get_spending_by_category_only_counts_current_users_data(db_session):
    user, checking, credit = _setup_user_with_data(db_session)

    other_user = User(firebase_uid="other-tool-uid", email="othertool@example.com")
    db_session.add(other_user)
    db_session.flush()
    other_institution = Institution(name="Other Bank")
    db_session.add(other_institution)
    db_session.flush()
    other_account = Account(
        user_id=other_user.id, institution_id=other_institution.id, name="Other Checking",
        type="checking", balance=Decimal("500"), last_four_digits="3333", sync_status="manual",
    )
    db_session.add(other_account)
    db_session.flush()
    groceries = db_session.query(Category).filter(Category.name == "Groceries").first()
    db_session.add(Transaction(
        account_id=other_account.id, category_id=groceries.id, merchant="Other Store",
        amount=Decimal("9999.00"), date=date.today(), status="completed",
    ))
    db_session.commit()

    result = get_spending_by_category(db_session, user.id)
    total_for_groceries = next(c["total"] for c in result["by_category"] if c["category"] == "Groceries")
    assert total_for_groceries == 350.00  # only THIS user's 50 + 300, not the other user's 9999
