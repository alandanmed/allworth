from unittest.mock import patch

from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.models import User

client = TestClient(app)


def _override_db(session):
    def _get_db():
        yield session
    return _get_db


def test_get_and_update_daily_summary_preference(db_session):
    user = User(firebase_uid="pref-uid", email="pref@example.com")
    db_session.add(user)
    db_session.commit()

    app.dependency_overrides[get_db] = _override_db(db_session)
    try:
        with patch(
            "app.dependencies.verify_firebase_token",
            return_value={"uid": "pref-uid", "email": "pref@example.com"},
        ):
            get_response = client.get(
                "/users/me/preferences", headers={"Authorization": "Bearer fake"}
            )
            assert get_response.json()["daily_summary_enabled"] is True

            patch_response = client.patch(
                "/users/me/preferences",
                json={"daily_summary_enabled": False},
                headers={"Authorization": "Bearer fake"},
            )
            assert patch_response.json()["daily_summary_enabled"] is False

        db_session.refresh(user)
        assert user.daily_summary_enabled is False
    finally:
        app.dependency_overrides.clear()
