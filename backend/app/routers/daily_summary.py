from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import DailySummary, User
from app.schemas.daily_summary import DailySummaryOut
from app.utils.daily_summary import calculate_daily_summary

router = APIRouter(prefix="/summaries/daily", tags=["daily-summaries"])


@router.post("/generate", response_model=DailySummaryOut)
def generate_todays_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DailySummary:
    today = date.today()
    computed = calculate_daily_summary(db, current_user.id, today)

    summary = (
        db.query(DailySummary)
        .filter(DailySummary.user_id == current_user.id, DailySummary.date == today)
        .first()
    )

    if summary:
        for key, value in computed.items():
            setattr(summary, key, value)
    else:
        summary = DailySummary(user_id=current_user.id, date=today, **computed)
        db.add(summary)

    db.commit()
    db.refresh(summary)
    return summary


@router.get("/{summary_date}", response_model=DailySummaryOut)
def get_summary_for_date(
    summary_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DailySummary:
    summary = (
        db.query(DailySummary)
        .filter(DailySummary.user_id == current_user.id, DailySummary.date == summary_date)
        .first()
    )
    if not summary:
        raise HTTPException(status_code=404, detail="No summary found for that date")
    return summary
