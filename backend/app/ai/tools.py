"""
Safe, predefined financial tools the AI assistant can call.

CRITICAL: every function here takes only a db session, the current user's id,
and simple typed parameters. None of them accept raw SQL or arbitrary queries.
The AI model can only ever trigger one of these exact functions — it has no
other way to touch the database.
"""

from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Account, Transaction
from app.utils.net_worth import calculate_totals
from app.utils.spending import calculate_percent_change, month_bounds, previous_month
from app.utils.subscriptions import detect_subscriptions


def get_net_worth(db: Session, user_id) -> dict:
    """Returns the user's current net worth, total assets, and total liabilities."""
    totals = calculate_totals(db, user_id)
    return {
        "net_worth": float(totals["net_worth"]),
        "total_assets": float(totals["total_assets"]),
        "total_liabilities": float(totals["total_liabilities"]),
    }


def get_account_balances(db: Session, user_id) -> dict:
    """Returns every account the user has, with its name, type, and current balance."""
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    return {
        "accounts": [
            {"name": a.name, "type": a.type, "balance": float(a.balance)} for a in accounts
        ]
    }


def get_recent_transactions(db: Session, user_id, limit: int = 10) -> dict:
    """Returns the user's most recent transactions, newest first."""
    limit = max(1, min(limit, 50))  # hard cap regardless of what's requested
    transactions = (
        db.query(Transaction)
        .join(Account)
        .filter(Account.user_id == user_id)
        .order_by(Transaction.date.desc())
        .limit(limit)
        .all()
    )
    return {
        "transactions": [
            {
                "merchant": t.merchant,
                "amount": float(t.amount),
                "date": t.date.isoformat(),
                "category": t.category.name if t.category else "Uncategorized",
            }
            for t in transactions
        ]
    }


def get_spending_by_category(db: Session, user_id, month: str | None = None) -> dict:
    """Returns total spending broken down by category for a given month (YYYY-MM), defaults to current month."""
    from app.routers.analytics import _total_spent  # reuse existing, tested logic
    from app.models import Category
    from sqlalchemy import func

    if month:
        year, month_num = map(int, month.split("-"))
    else:
        today = date.today()
        year, month_num = today.year, today.month

    start, end = month_bounds(year, month_num)

    rows = (
        db.query(Category.name, func.sum(Transaction.amount))
        .join(Transaction, Transaction.category_id == Category.id)
        .join(Account, Account.id == Transaction.account_id)
        .filter(Account.user_id == user_id)
        .filter(Transaction.date >= start, Transaction.date <= end)
        .filter(Transaction.amount > 0)
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return {
        "month": f"{year:04d}-{month_num:02d}",
        "by_category": [{"category": name, "total": float(total)} for name, total in rows],
    }


def compare_spending_periods(db: Session, user_id, month: str | None = None) -> dict:
    """Compares total spending for a given month against the previous month."""
    from app.routers.analytics import _total_spent

    if month:
        year, month_num = map(int, month.split("-"))
    else:
        today = date.today()
        year, month_num = today.year, today.month

    start, end = month_bounds(year, month_num)
    prev_year, prev_month_num = previous_month(year, month_num)
    prev_start, prev_end = month_bounds(prev_year, prev_month_num)

    current_total = _total_spent(db, user_id, start, end)
    previous_total = _total_spent(db, user_id, prev_start, prev_end)

    return {
        "current_month": f"{year:04d}-{month_num:02d}",
        "current_month_total": float(current_total),
        "previous_month_total": float(previous_total),
        "dollar_difference": float(current_total - previous_total),
        "percent_change": calculate_percent_change(current_total, previous_total),
    }


def get_subscriptions(db: Session, user_id) -> dict:
    """Returns detected recurring subscriptions with their monthly cost and any price changes."""
    transactions = (
        db.query(Transaction)
        .join(Account)
        .filter(Account.user_id == user_id)
        .all()
    )
    simple_transactions = [
        {"id": str(t.id), "merchant": t.merchant, "amount": float(t.amount), "date": t.date.isoformat(),
         "category": t.category.name if t.category else "Uncategorized"}
        for t in transactions
    ]
    subscriptions = detect_subscriptions(simple_transactions)
    return {"subscriptions": subscriptions}


def find_large_transactions(db: Session, user_id, limit: int = 5) -> dict:
    """Returns the user's largest spending transactions (not income/refunds), most recent 90 days."""
    from datetime import timedelta

    limit = max(1, min(limit, 20))
    cutoff = date.today() - timedelta(days=90)

    transactions = (
        db.query(Transaction)
        .join(Account)
        .filter(Account.user_id == user_id)
        .filter(Transaction.date >= cutoff)
        .filter(Transaction.amount > 0)
        .order_by(Transaction.amount.desc())
        .limit(limit)
        .all()
    )
    return {
        "transactions": [
            {"merchant": t.merchant, "amount": float(t.amount), "date": t.date.isoformat()}
            for t in transactions
        ]
    }
