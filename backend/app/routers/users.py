from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.user import UserPreferencesOut, UserPreferencesUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/preferences", response_model=UserPreferencesOut)
def get_preferences(current_user: User = Depends(get_current_user)) -> UserPreferencesOut:
    return UserPreferencesOut(daily_summary_enabled=current_user.daily_summary_enabled)


@router.patch("/me/preferences", response_model=UserPreferencesOut)
def update_preferences(
    payload: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserPreferencesOut:
    current_user.daily_summary_enabled = payload.daily_summary_enabled
    db.commit()
    db.refresh(current_user)
    return UserPreferencesOut(daily_summary_enabled=current_user.daily_summary_enabled)
