from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Account, Category, Transaction, User
from app.schemas.analytics import SpendingSummaryOut
from app.utils.spending import calculate_percent_change, month_bounds, previous_month

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _total_spent(db: Session, user_id, start: date, end: date):
    result = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .join(Account)
        .filter(Account.user_id == user_id)
        .filter(Transaction.date >= start, Transaction.date <= end)
        .filter(Transaction.amount > 0)
        .scalar()
    )
    return result


@router.get("/spending-summary", response_model=SpendingSummaryOut)
def get_spending_summary(
    month: str | None = Query(default=None, description="YYYY-MM, defaults to current month"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SpendingSummaryOut:
    if month:
        year, month_num = map(int, month.split("-"))
    else:
        today = date.today()
        year, month_num = today.year, today.month

    start, end = month_bounds(year, month_num)
    prev_year, prev_month_num = previous_month(year, month_num)
    prev_start, prev_end = month_bounds(prev_year, prev_month_num)

    total_spent = _total_spent(db, current_user.id, start, end)
    previous_total = _total_spent(db, current_user.id, prev_start, prev_end)

    by_category_rows = (
        db.query(Category.name, func.sum(Transaction.amount))
        .join(Transaction, Transaction.category_id == Category.id)
        .join(Account, Account.id == Transaction.account_id)
        .filter(Account.user_id == current_user.id)
        .filter(Transaction.date >= start, Transaction.date <= end)
        .filter(Transaction.amount > 0)
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return SpendingSummaryOut(
        month=f"{year:04d}-{month_num:02d}",
        total_spent=total_spent,
        previous_month_total_spent=previous_total,
        percent_change=calculate_percent_change(total_spent, previous_total),
        by_category=[{"category": name, "total": total} for name, total in by_category_rows],
    )
