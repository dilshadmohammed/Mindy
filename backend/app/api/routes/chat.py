from fastapi import APIRouter, Depends, Request, HTTPException
from app.core.config import settings
from app import crud, models
from sqlalchemy.orm import Session
from app.api import deps
from app import schemas
from app.core.llm import chat_with_mental_health_bot
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
    return schemas.ChatHistoryResponse(chat_history=chat_history or [])


@router.post("/")
async def create_chat_message(
    request_data: schemas.ChatMessageCreateRequest,
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
    bot_content = chat_with_mental_health_bot(content, history=[{"role": "user", "parts": [content]}])
    bot_message_data = schemas.ChatMessage(content=bot_content, role="bot")
    bot_message = crud.chat.create_chat_message(db, user_id=user.id, chat_message=bot_message_data)
    return {
        "message":schemas.ChatMessage.from_orm(user_message),
        "bot_message":schemas.ChatMessage.from_orm(bot_message)
        }
    
@router.post("/clear-chat")
async def clear_chat_history(
    db: Session = Depends(deps.get_db),
    user: models.User = Depends(deps.get_current_user)
):
    """
    Clear chat history for the authenticated user.
    """
    crud.chat.clear_chat_history(db, user_id=user.id)
    return {"message": "Chat history cleared successfully"}
