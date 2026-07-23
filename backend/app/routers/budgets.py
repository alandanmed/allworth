import uuid
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Account, Budget, Category, Transaction, User
from app.schemas.budget import BudgetCreate, BudgetOut
from app.utils.spending import month_bounds

router = APIRouter(prefix="/budgets", tags=["budgets"])


def _spent_this_month(db: Session, user_id, category_id) -> Decimal:
    today = date.today()
    start, end = month_bounds(today.year, today.month)

    result = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .join(Account)
        .filter(Account.user_id == user_id)
        .filter(Transaction.category_id == category_id)
        .filter(Transaction.date >= start, Transaction.date <= end)
        .filter(Transaction.amount > 0)
        .scalar()
    )
    return result


def _to_budget_out(db: Session, budget: Budget) -> BudgetOut:
    spent = _spent_this_month(db, budget.user_id, budget.category_id)
    remaining = budget.monthly_limit - spent
    percent_used = float(spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0.0

    return BudgetOut(
        id=budget.id,
        category=budget.category,
        monthly_limit=budget.monthly_limit,
        spent_this_month=spent,
        remaining=remaining,
        percent_used=round(percent_used, 1),
        is_over_budget=spent > budget.monthly_limit,
    )


@router.get("", response_model=list[BudgetOut])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BudgetOut]:
    budgets = (
        db.query(Budget)
        .options(joinedload(Budget.category))
        .filter(Budget.user_id == current_user.id)
        .all()
    )
    return [_to_budget_out(db, b) for b in budgets]


@router.post("", response_model=BudgetOut)
def create_or_update_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BudgetOut:
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    budget = (
        db.query(Budget)
        .filter(Budget.user_id == current_user.id, Budget.category_id == payload.category_id)
        .first()
    )

    if budget:
        budget.monthly_limit = payload.monthly_limit
    else:
        budget = Budget(
            user_id=current_user.id,
            category_id=payload.category_id,
            monthly_limit=payload.monthly_limit,
        )
        db.add(budget)

    db.commit()
    db.refresh(budget)
    return _to_budget_out(db, budget)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(
    budget_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()
