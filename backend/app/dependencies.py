from fastapi import Depends, HTTPException, Request
from firebase_admin.auth import ExpiredIdTokenError, InvalidIdTokenError
from sqlalchemy.orm import Session

from app.database import get_db
from app.firebase import verify_firebase_token
from app.models import User


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")

    id_token = auth_header.removeprefix("Bearer ").strip()

    try:
        decoded = verify_firebase_token(id_token)
    except (InvalidIdTokenError, ExpiredIdTokenError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    firebase_uid = decoded["uid"]
    email = decoded.get("email", "")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if user:
        return user

    # No user with this exact firebase_uid yet. Check if this email was
    # previously linked to a different (e.g. recreated/deleted) Firebase
    # account, and re-link it instead of trying to insert a duplicate.
    existing_by_email = db.query(User).filter(User.email == email).first()
    if existing_by_email:
        existing_by_email.firebase_uid = firebase_uid
        db.commit()
        db.refresh(existing_by_email)
        return existing_by_email

    # Genuinely new user — create their local profile row.
    user = User(firebase_uid=firebase_uid, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
