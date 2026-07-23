import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.category import CategoryOut


class BudgetCreate(BaseModel):
    category_id: uuid.UUID
    monthly_limit: Decimal


class BudgetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category: CategoryOut
    monthly_limit: Decimal
    spent_this_month: Decimal
    remaining: Decimal
    percent_used: float
    is_over_budget: bool
