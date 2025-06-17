from fastapi import APIRouter, Depends, Request, HTTPException
from app.core.config import settings
from app import crud, models
from sqlalchemy.orm import Session
from app.api import deps
from app import schemas

router = APIRouter()

@router.get("/history")
async def get_chat_history(
    request: Request,
    db: Session = Depends(deps.get_db),
    user: models.User = Depends(deps.get_current_user)
):
    """
    Retrieve chat history for the authenticated user.
    """
    chat_history = crud.chat.get_chat_history(db, user_id=user.id)
    if not chat_history:
        raise HTTPException(status_code=404, detail="Chat history not found")
    
    return schemas.ChatHistoryResponse(chat_history=chat_history)

from pydantic import BaseModel

class ChatMessageCreateRequest(BaseModel):
    content: str

@router.post("/")
async def create_chat_message(
    request_data: ChatMessageCreateRequest,
    db: Session = Depends(deps.get_db),
    user: models.User = Depends(deps.get_current_user)
):
    """
    Create a new chat message for the authenticated user and generate a bot response.
    """
    content = request_data.content
    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    
    # Store user message
    user_message_data = schemas.ChatMessage(content=content, role="user")
    user_message = crud.chat.create_chat_message(db, user_id=user.id, chat_message=user_message_data)
    
    # Generate dummy bot response
    bot_content = f"Bot reply to: {content}"
    bot_message_data = schemas.ChatMessage(content=bot_content, role="bot")
    bot_message = crud.chat.create_chat_message(db, user_id=user.id, chat_message=bot_message_data)
    return {
        "message":schemas.ChatMessage.from_orm(user_message),
        "bot_message":schemas.ChatMessage.from_orm(bot_message)
        }
    