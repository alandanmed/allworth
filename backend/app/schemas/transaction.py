import uuid
from datetime import date as date_type
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.category import CategoryOut


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    account_id: uuid.UUID
    merchant: str
    amount: Decimal
    date: date_type
    status: str
    notes: str | None
    category: CategoryOut | None
    created_at: datetime
