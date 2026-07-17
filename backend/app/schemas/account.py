import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.institution import InstitutionOut


class AccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    type: str
    balance: Decimal
    last_four_digits: str
    sync_status: str
    institution: InstitutionOut
    created_at: datetime
