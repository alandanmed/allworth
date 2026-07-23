from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.models import Account, Budget, Category, Institution, Transaction, User

client = TestClient(app)


def _override_db(session):
    def _get_db():
        yield session
    return _get_db


def _setup_user_with_account(db_session, uid="budget-uid", email="budget@example.com"):
    user = User(firebase_uid=uid, email=email)
    institution = Institution(name="Test Bank")
    db_session.add_all([user, institution])
    db_session.flush()

    account = Account(
        user_id=user.id, institution_id=institution.id, name="Checking",
        type="checking", balance=1000, last_four_digits="1234", sync_status="manual",
    )
    db_session.add(account)
    db_session.flush()
    return user, account


def test_create_budget_and_compute_remaining(db_session):
    from unittest.mock import patch

    user, account = _setup_user_with_account(db_session)
    category = Category(name="Groceries")
    db_session.add(category)
    db_session.flush()

    today = date.today()
    db_session.add(Transaction(
        account_id=account.id, category_id=category.id,
        merchant="Store", amount=Decimal("60.00"), date=today, status="completed",
    ))
    db_session.commit()

    app.dependency_overrides[get_db] = _override_db(db_session)
    try:
        with patch(
            "app.dependencies.verify_firebase_token",
            return_value={"uid": "budget-uid", "email": "budget@example.com"},
        ):
            response = client.post(
                "/budgets",
                json={"category_id": str(category.id), "monthly_limit": "100.00"},
                headers={"Authorization": "Bearer fake"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["spent_this_month"] == "60.00"
        assert data["remaining"] == "40.00"
        assert data["is_over_budget"] is False
    finally:
        app.dependency_overrides.clear()


def test_posting_same_category_twice_updates_not_duplicates(db_session):
    from unittest.mock import patch

    user, account = _setup_user_with_account(db_session, uid="budget-uid-2", email="budget2@example.com")
    category = Category(name="Dining")
    db_session.add(category)
    db_session.commit()

    app.dependency_overrides[get_db] = _override_db(db_session)
    try:
        with patch(
            "app.dependencies.verify_firebase_token",
            return_value={"uid": "budget-uid-2", "email": "budget2@example.com"},
        ):
            client.post(
                "/budgets",
                json={"category_id": str(category.id), "monthly_limit": "100.00"},
                headers={"Authorization": "Bearer fake"},
            )
            client.post(
                "/budgets",
                json={"category_id": str(category.id), "monthly_limit": "150.00"},
                headers={"Authorization": "Bearer fake"},
            )

        budgets = db_session.query(Budget).filter(Budget.user_id == user.id).all()
        assert len(budgets) == 1
        assert budgets[0].monthly_limit == Decimal("150.00")
    finally:
        app.dependency_overrides.clear()


def test_over_budget_flag_is_true_when_spending_exceeds_limit(db_session):
    from unittest.mock import patch

    user, account = _setup_user_with_account(db_session, uid="budget-uid-3", email="budget3@example.com")
    category = Category(name="Shopping")
    db_session.add(category)
    db_session.flush()

    today = date.today()
    db_session.add(Transaction(
        account_id=account.id, category_id=category.id,
        merchant="Store", amount=Decimal("200.00"), date=today, status="completed",
    ))
    db_session.commit()

    app.dependency_overrides[get_db] = _override_db(db_session)
    try:
        with patch(
            "app.dependencies.verify_firebase_token",
            return_value={"uid": "budget-uid-3", "email": "budget3@example.com"},
        ):
            response = client.post(
                "/budgets",
                json={"category_id": str(category.id), "monthly_limit": "100.00"},
                headers={"Authorization": "Bearer fake"},
            )

        data = response.json()
        assert data["is_over_budget"] is True
        assert data["remaining"] == "-100.00"
    finally:
        app.dependency_overrides.clear()
