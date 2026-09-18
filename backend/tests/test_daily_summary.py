from datetime import date, timedelta
from decimal import Decimal

from app.models import Account, Budget, Category, Institution, Transaction, User
from app.utils.daily_summary import calculate_daily_summary


def _setup_user_with_account(db_session, uid="daily-uid", email="daily@example.com"):
    user = User(firebase_uid=uid, email=email)
    institution = Institution(name="Test Bank")
    db_session.add_all([user, institution])
    db_session.flush()

    account = Account(
        user_id=user.id, institution_id=institution.id, name="Checking",
        type="checking", balance=Decimal("1000.00"), last_four_digits="1234", sync_status="manual",
    )
    db_session.add(account)
    db_session.flush()
    return user, account


def test_calculates_total_spent_and_income_for_target_date(db_session):
    user, account = _setup_user_with_account(db_session)
    category = Category(name="Groceries")
    db_session.add(category)
    db_session.flush()

    today = date.today()
    db_session.add_all([
        Transaction(account_id=account.id, category_id=category.id, merchant="Store",
                    amount=Decimal("50.00"), date=today, status="completed"),
        Transaction(account_id=account.id, merchant="Payroll",
                    amount=Decimal("-200.00"), date=today, status="completed"),
    ])
    db_session.commit()

    result = calculate_daily_summary(db_session, user.id, today)
    assert result["total_spent"] == Decimal("50.00")
    assert result["total_income"] == Decimal("200.00")


def test_flags_unusually_large_transaction_vs_trailing_average(db_session):
    user, account = _setup_user_with_account(db_session, uid="daily-uid-2", email="daily2@example.com")
    category = Category(name="Shopping")
    db_session.add(category)
    db_session.flush()

    today = date.today()
    # Trailing history: consistent small transactions (~$20 average)
    for i in range(5):
        db_session.add(Transaction(
            account_id=account.id, category_id=category.id, merchant="Small Store",
            amount=Decimal("20.00"), date=today - timedelta(days=i + 1), status="completed",
        ))
    # Today: one much larger transaction
    db_session.add(Transaction(
        account_id=account.id, category_id=category.id, merchant="Big Purchase",
        amount=Decimal("500.00"), date=today, status="completed",
    ))
    db_session.commit()

    result = calculate_daily_summary(db_session, user.id, today)
    unusual_merchants = [t["merchant"] for t in result["unusual_transactions"]]
    assert "Big Purchase" in unusual_merchants


def test_budget_warning_appears_when_over_80_percent(db_session):
    user, account = _setup_user_with_account(db_session, uid="daily-uid-3", email="daily3@example.com")
    category = Category(name="Dining")
    db_session.add(category)
    db_session.flush()

    budget = Budget(user_id=user.id, category_id=category.id, monthly_limit=Decimal("100.00"))
    db_session.add(budget)
    db_session.flush()

    today = date.today()
    db_session.add(Transaction(
        account_id=account.id, category_id=category.id, merchant="Restaurant",
        amount=Decimal("90.00"), date=today, status="completed",
    ))
    db_session.commit()

    result = calculate_daily_summary(db_session, user.id, today)
    assert len(result["budget_warnings"]) == 1
    assert result["budget_warnings"][0]["category"] == "Dining"


def test_no_prior_history_gives_zero_average_not_a_crash(db_session):
    user, account = _setup_user_with_account(db_session, uid="daily-uid-4", email="daily4@example.com")
    today = date.today()

    result = calculate_daily_summary(db_session, user.id, today)
    assert result["daily_average"] == Decimal("0")
    assert result["percent_vs_average"] is None
    assert result["unusual_transactions"] == []
