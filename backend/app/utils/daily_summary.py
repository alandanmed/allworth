from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Account, Budget, Category, Transaction

TRAILING_DAYS_FOR_AVERAGE = 30
UNUSUAL_TRANSACTION_MULTIPLIER = 2.0  # flag anything 2x+ the trailing average transaction size


def calculate_daily_summary(db: Session, user_id, target_date: date) -> dict:
    # --- Today's totals ---
    todays_transactions = (
        db.query(Transaction)
        .join(Account)
        .filter(Account.user_id == user_id, Account.sync_status != "disconnected", Transaction.date == target_date)
        .all()
    )

    total_spent = sum((t.amount for t in todays_transactions if t.amount > 0), Decimal("0"))
    total_income = sum((-t.amount for t in todays_transactions if t.amount < 0), Decimal("0"))

    by_category_map: dict[str, Decimal] = {}
    for t in todays_transactions:
        if t.amount <= 0:
            continue
        category_name = t.category.name if t.category else "Uncategorized"
        by_category_map[category_name] = by_category_map.get(category_name, Decimal("0")) + t.amount
    by_category = [{"category": k, "total": float(v)} for k, v in by_category_map.items()]

    # --- Trailing 30-day daily average spend (excludes today) ---
    window_start = target_date - timedelta(days=TRAILING_DAYS_FOR_AVERAGE)
    window_end = target_date - timedelta(days=1)

    trailing_total = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .join(Account)
        .filter(Account.user_id == user_id, Account.sync_status != "disconnected")
        .filter(Transaction.date >= window_start, Transaction.date <= window_end)
        .filter(Transaction.amount > 0)
        .scalar()
    )
    daily_average = trailing_total / TRAILING_DAYS_FOR_AVERAGE if trailing_total else Decimal("0")

    percent_vs_average = None
    if daily_average > 0:
        percent_vs_average = round(float((total_spent - daily_average) / daily_average * 100), 1)

    # --- Unusually large transactions today ---
    trailing_transactions_count = (
        db.query(func.count(Transaction.id))
        .join(Account)
        .filter(Account.user_id == user_id, Account.sync_status != "disconnected")
        .filter(Transaction.date >= window_start, Transaction.date <= window_end)
        .filter(Transaction.amount > 0)
        .scalar()
    )
    avg_transaction_size = (
        trailing_total / trailing_transactions_count
        if trailing_transactions_count
        else Decimal("0")
    )

    unusual_transactions = []
    if avg_transaction_size > 0:
        for t in todays_transactions:
            if t.amount > 0 and t.amount >= avg_transaction_size * Decimal(str(UNUSUAL_TRANSACTION_MULTIPLIER)):
                unusual_transactions.append(
                    {"merchant": t.merchant, "amount": float(t.amount), "category": t.category.name if t.category else "Uncategorized"}
                )

    # --- Budget warnings (categories spent on today that are at/over budget this month) ---
    from app.utils.spending import month_bounds

    month_start, month_end = month_bounds(target_date.year, target_date.month)
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()

    budget_warnings = []
    for budget in budgets:
        spent_this_month = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .join(Account)
            .filter(Account.user_id == user_id, Account.sync_status != "disconnected")
            .filter(Transaction.category_id == budget.category_id)
            .filter(Transaction.date >= month_start, Transaction.date <= month_end)
            .filter(Transaction.amount > 0)
            .scalar()
        )
        percent_used = float(spent_this_month / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0.0
        if percent_used >= 80:
            budget_warnings.append({
                "category": budget.category.name,
                "percent_used": round(percent_used, 1),
                "is_over_budget": spent_this_month > budget.monthly_limit,
            })

    return {
        "total_spent": total_spent,
        "total_income": total_income,
        "by_category": by_category,
        "daily_average": daily_average,
        "percent_vs_average": percent_vs_average,
        "unusual_transactions": unusual_transactions,
        "budget_warnings": budget_warnings,
    }
