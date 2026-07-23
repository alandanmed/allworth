from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import NetWorthSnapshot, User
from app.schemas.net_worth import NetWorthSnapshotOut
from app.utils.net_worth import calculate_totals

router = APIRouter(prefix="/net-worth", tags=["net-worth"])


@router.post("/snapshot", response_model=NetWorthSnapshotOut)
def record_todays_snapshot(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NetWorthSnapshot:
    totals = calculate_totals(db, current_user.id)
    today = date.today()

    snapshot = (
        db.query(NetWorthSnapshot)
        .filter(NetWorthSnapshot.user_id == current_user.id, NetWorthSnapshot.date == today)
        .first()
    )

    if snapshot:
        snapshot.net_worth = totals["net_worth"]
        snapshot.total_assets = totals["total_assets"]
        snapshot.total_liabilities = totals["total_liabilities"]
    else:
        snapshot = NetWorthSnapshot(user_id=current_user.id, date=today, **totals)
        db.add(snapshot)

    db.commit()
    db.refresh(snapshot)
    return snapshot


@router.get("/history", response_model=list[NetWorthSnapshotOut])
def get_net_worth_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[NetWorthSnapshot]:
    return (
        db.query(NetWorthSnapshot)
        .filter(NetWorthSnapshot.user_id == current_user.id)
        .order_by(NetWorthSnapshot.date.asc())
        .all()
    )
