import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from app.config import settings

cred = credentials.Certificate(settings.firebase_service_account_path)
firebase_app = firebase_admin.initialize_app(cred)


def verify_firebase_token(id_token: str) -> dict:
    """
    Verifies a Firebase ID token's signature and expiry.
    Raises firebase_admin.auth.InvalidIdTokenError (or similar) if invalid.
    Returns the decoded token payload, which includes 'uid' and 'email'.
    """
    return firebase_auth.verify_id_token(id_token)
