from unittest.mock import patch

from fastapi.testclient import TestClient
from firebase_admin.auth import InvalidIdTokenError

from app.database import get_db
from app.main import app
from app.models import Account, Institution, User

client = TestClient(app)


def _fake_decoded_token(uid: str, email: str) -> dict:
    return {"uid": uid, "email": email}


def _override_db(session):
    def _get_db():
        yield session
    return _get_db


def test_accounts_requires_auth_header():
    response = client.get("/accounts")
    assert response.status_code == 401


def test_accounts_rejects_invalid_token(db_session):
    app.dependency_overrides[get_db] = _override_db(db_session)
    try:
        with patch(
            "app.dependencies.verify_firebase_token",
            side_effect=InvalidIdTokenError("bad token"),
        ):
            response = client.get("/accounts", headers={"Authorization": "Bearer fake"})
        assert response.status_code == 401
    finally:
        app.dependency_overrides.clear()


def test_accounts_creates_user_on_first_valid_token(db_session):
    app.dependency_overrides[get_db] = _override_db(db_session)
    try:
        with patch(
            "app.dependencies.verify_firebase_token",
            return_value=_fake_decoded_token("test-uid-123", "newuser@example.com"),
        ):
            response = client.get("/accounts", headers={"Authorization": "Bearer fake"})

        assert response.status_code == 200
        assert response.json() == []

        created_user = db_session.query(User).filter(User.firebase_uid == "test-uid-123").first()
        assert created_user is not None
        assert created_user.email == "newuser@example.com"
    finally:
        app.dependency_overrides.clear()


def test_accounts_only_returns_own_accounts(db_session):
    owner = User(firebase_uid="owner-uid", email="owner@example.com")
    other = User(firebase_uid="other-uid", email="other@example.com")
    institution = Institution(name="Test Bank")
    db_session.add_all([owner, other, institution])
    db_session.flush()

    owner_account = Account(
        user_id=owner.id, institution_id=institution.id, name="Owner Checking",
        type="checking", balance=100, last_four_digits="1111", sync_status="manual",
    )
    other_account = Account(
        user_id=other.id, institution_id=institution.id, name="Other Checking",
        type="checking", balance=200, last_four_digits="2222", sync_status="manual",
    )
    db_session.add_all([owner_account, other_account])
    db_session.commit()

    app.dependency_overrides[get_db] = _override_db(db_session)
    try:
        with patch(
            "app.dependencies.verify_firebase_token",
            return_value=_fake_decoded_token("owner-uid", "owner@example.com"),
        ):
            response = client.get("/accounts", headers={"Authorization": "Bearer fake"})

        assert response.status_code == 200
        names = [a["name"] for a in response.json()]
        assert names == ["Owner Checking"]
    finally:
        app.dependency_overrides.clear()
