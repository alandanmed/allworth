from decimal import Decimal

from pydantic import BaseModel


class SpendingByCategoryOut(BaseModel):
    category: str
    total: Decimal


class SpendingSummaryOut(BaseModel):
    month: str  # "2026-07"
    total_spent: Decimal
    previous_month_total_spent: Decimal
    percent_change: float | None
    by_category: list[SpendingByCategoryOut]
