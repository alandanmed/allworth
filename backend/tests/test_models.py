from decimal import Decimal

from app.models import Account, Category, Institution, Transaction, User


def test_create_user_and_account(db_session):
    user = User(firebase_uid="test-firebase-uid-1", email="test@example.com")
    db_session.add(user)
    db_session.flush()

    institution = Institution(name="Test Bank", logo_color="#000000")
    db_session.add(institution)
    db_session.flush()

    account = Account(
        user_id=user.id,
        institution_id=institution.id,
        name="Test Checking",
        type="checking",
        balance=Decimal("100.00"),
        last_four_digits="1234",
        sync_status="manual",
    )
    db_session.add(account)
    db_session.commit()

    assert account.id is not None
    assert account.user_id == user.id


def test_deleting_account_cascades_to_transactions(db_session):
    user = User(firebase_uid="test-firebase-uid-2", email="test2@example.com")
    institution = Institution(name="Test Bank 2", logo_color="#000000")
    category = Category(name="Test Category")
    db_session.add_all([user, institution, category])
    db_session.flush()

    account = Account(
        user_id=user.id,
        institution_id=institution.id,
        name="Test Account",
        type="checking",
        balance=Decimal("50.00"),
        last_four_digits="5678",
        sync_status="manual",
    )
    db_session.add(account)
    db_session.flush()

    transaction = Transaction(
        account_id=account.id,
        category_id=category.id,
        merchant="Test Merchant",
        amount=Decimal("25.00"),
        date="2026-07-01",
        status="completed",
    )
    db_session.add(transaction)
    db_session.commit()

    transaction_id = transaction.id

    db_session.delete(account)
    db_session.commit()

    remaining = db_session.query(Transaction).filter(Transaction.id == transaction_id).first()
    assert remaining is None
