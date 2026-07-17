from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from fastapi import Depends, HTTPException


def get_current_user(db: Session = Depends(get_db)) -> User:
    """
    TEMPORARY: returns the single seeded demo user.
    This will be replaced in Phase 6 with real session/token-based auth —
    every endpoint using this dependency should keep working unchanged,
    since Phase 6 only needs to swap what THIS function does internally.
    """
    user = db.query(User).filter(User.email == "alan@example.com").first()
    if not user:
        raise HTTPException(status_code=500, detail="Demo user not found — did you run the seed script?")
    return user
