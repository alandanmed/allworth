from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.mock_assistant import generate_response
from app.database import get_db
from app.dependencies import get_current_user
from app.models import AiToolCallLog, ChatConversation, ChatMessage, User
from app.schemas.chat import (
    ChatConversationSummaryOut,
    ChatMessageIn,
    ChatMessageOut,
    ChatResponseOut,
)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/conversations", response_model=list[ChatConversationSummaryOut])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ChatConversationSummaryOut]:
    conversations = (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == current_user.id)
        .order_by(ChatConversation.updated_at.desc())
        .all()
    )

    summaries = []
    for conv in conversations:
        first_user_message = next((m for m in conv.messages if m.role == "user"), None)
        preview = first_user_message.content if first_user_message else "New conversation"
        summaries.append(
            ChatConversationSummaryOut(id=conv.id, created_at=conv.created_at, preview=preview)
        )
    return summaries


@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_conversation(
    conversation_id,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    conversation = (
        db.query(ChatConversation)
        .filter(ChatConversation.id == conversation_id, ChatConversation.user_id == current_user.id)
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conversation)
    db.commit()


@router.post("", response_model=ChatResponseOut)
def send_message(
    payload: ChatMessageIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatResponseOut:
    if payload.conversation_id:
        conversation = (
            db.query(ChatConversation)
            .filter(ChatConversation.id == payload.conversation_id, ChatConversation.user_id == current_user.id)
            .first()
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = ChatConversation(user_id=current_user.id)
        db.add(conversation)
        db.flush()

    user_message = ChatMessage(conversation_id=conversation.id, role="user", content=payload.message)
    db.add(user_message)
    db.flush()

    response_text, tool_calls = generate_response(db, current_user.id, payload.message)

    assistant_message = ChatMessage(conversation_id=conversation.id, role="assistant", content=response_text)
    db.add(assistant_message)
    db.flush()

    for call in tool_calls:
        db.add(AiToolCallLog(
            message_id=assistant_message.id,
            tool_name=call["tool_name"],
            tool_input=call["tool_input"],
            tool_output=call["tool_output"],
        ))

    conversation.updated_at = assistant_message.created_at
    db.commit()
    db.refresh(assistant_message)

    return ChatResponseOut(conversation_id=conversation.id, message=assistant_message)


@router.get("/{conversation_id}/messages", response_model=list[ChatMessageOut])
def get_conversation_messages(
    conversation_id,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ChatMessage]:
    conversation = (
        db.query(ChatConversation)
        .filter(ChatConversation.id == conversation_id, ChatConversation.user_id == current_user.id)
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation.messages
