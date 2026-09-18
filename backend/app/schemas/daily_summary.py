import uuid
from datetime import date as date_type
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class DailySummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    date: date_type
    total_spent: Decimal
    total_income: Decimal
    by_category: list[dict]
    daily_average: Decimal
    percent_vs_average: float | None
    unusual_transactions: list[dict]
    budget_warnings: list[dict]
