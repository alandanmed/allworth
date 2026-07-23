from datetime import date
from decimal import Decimal
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.models import Account, AiToolCallLog, ChatConversation, ChatMessage, Institution, User

client = TestClient(app)


def _override_db(session):
    def _get_db():
        yield session
    return _get_db


def _setup_user(db_session, uid="chat-uid", email="chat@example.com"):
    user = User(firebase_uid=uid, email=email)
    institution = Institution(name="Test Bank")
    db_session.add_all([user, institution])
    db_session.flush()

    account = Account(
        user_id=user.id, institution_id=institution.id, name="Checking",
        type="checking", balance=Decimal("500.00"), last_four_digits="1234", sync_status="manual",
    )
    db_session.add(account)
    db_session.commit()
    return user


def test_first_message_creates_a_new_conversation(db_session):
    user = _setup_user(db_session)

    app.dependency_overrides[get_db] = _override_db(db_session)
    try:
        with patch(
            "app.dependencies.verify_firebase_token",
            return_value={"uid": "chat-uid", "email": "chat@example.com"},
        ):
            response = client.post(
                "/chat",
                json={"message": "what's my net worth?"},
                headers={"Authorization": "Bearer fake"},
            )

        assert response.status_code == 200
        data = response.json()
        assert "net worth" in data["message"]["content"].lower()
        assert data["message"]["role"] == "assistant"

        conversation_id = data["conversation_id"]
        conversation = db_session.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()
        assert conversation is not None
        assert conversation.user_id == user.id

        messages = db_session.query(ChatMessage).filter(ChatMessage.conversation_id == conversation_id).all()
        assert len(messages) == 2  # user message + assistant reply

        tool_logs = (
            db_session.query(AiToolCallLog)
            .join(ChatMessage)
            .filter(ChatMessage.conversation_id == conversation_id)
            .all()
        )
        assert len(tool_logs) == 1
        assert tool_logs[0].tool_name == "net_worth"
    finally:
        app.dependency_overrides.clear()


def test_followup_message_reuses_same_conversation(db_session):
    _setup_user(db_session, uid="chat-uid-2", email="chat2@example.com")

    app.dependency_overrides[get_db] = _override_db(db_session)
    try:
        with patch(
            "app.dependencies.verify_firebase_token",
            return_value={"uid": "chat-uid-2", "email": "chat2@example.com"},
        ):
            first = client.post(
                "/chat", json={"message": "what's my net worth?"}, headers={"Authorization": "Bearer fake"}
            )
            conversation_id = first.json()["conversation_id"]

            second = client.post(
                "/chat",
                json={"conversation_id": conversation_id, "message": "what about my balances?"},
                headers={"Authorization": "Bearer fake"},
            )

        assert second.json()["conversation_id"] == conversation_id

        messages = db_session.query(ChatMessage).filter(ChatMessage.conversation_id == conversation_id).all()
        assert len(messages) == 4  # 2 user + 2 assistant across both turns
    finally:
        app.dependency_overrides.clear()


def test_cannot_post_to_another_users_conversation(db_session):
    owner = _setup_user(db_session, uid="owner-chat-uid", email="ownerchat@example.com")
    conversation = ChatConversation(user_id=owner.id)
    db_session.add(conversation)
    db_session.commit()

    _setup_user(db_session, uid="attacker-chat-uid", email="attackerchat@example.com")

    app.dependency_overrides[get_db] = _override_db(db_session)
    try:
        with patch(
            "app.dependencies.verify_firebase_token",
            return_value={"uid": "attacker-chat-uid", "email": "attackerchat@example.com"},
        ):
            response = client.post(
                "/chat",
                json={"conversation_id": str(conversation.id), "message": "hi"},
                headers={"Authorization": "Bearer fake"},
            )
        assert response.status_code == 404
    finally:
        app.dependency_overrides.clear()
