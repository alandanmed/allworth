import uuid
from datetime import date as date_type
from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Numeric, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class DailySummary(Base):
    __tablename__ = "daily_summaries"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_user_summary_date"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    total_spent: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_income: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    by_category: Mapped[list] = mapped_column(JSON, nullable=False)
    daily_average: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    percent_vs_average: Mapped[float] = mapped_column(nullable=True)
    unusual_transactions: Mapped[list] = mapped_column(JSON, nullable=False)
    budget_warnings: Mapped[list] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
