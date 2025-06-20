from fastapi import APIRouter, Depends, Request, HTTPException, WebSocket, WebSocketDisconnect
from app.core.config import settings
from app import crud, models
from sqlalchemy.orm import Session
from app.api import deps
from app import schemas
from app.core.llm import get_langchain_chain, stream_bot_response
import json
import asyncio

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
   

@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    db_gen = deps.get_db()
    db = next(db_gen)
    try:
        await websocket.accept()
        access_token = websocket.query_params.get("access_token")
        if not access_token:
            await websocket.close(code=1008)
            return

        # Use deps.get_current_user with token
        try:
            user = deps.get_current_user_from_token(token=access_token, db=db)
        except Exception as e:
            print(f"Authentication failed: {e}")
            await websocket.close(code=1008)
            return

        chain = get_langchain_chain(db=db,user_id=user.id)
        cancel_event = asyncio.Event()
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    message_data = json.loads(data)
                    user_message = message_data.get("content", "")
                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({"error": "Invalid JSON format"}))
                    continue

                crud.chat.save_message(db, user_id=user.id, chat_message = schemas.ChatMessage(role="user",content=user_message))
                
                session_id = f"{user.id}-{websocket.client.host}-{websocket.client.port}"
                bot_response = ""
                async for token in stream_bot_response(session_id=session_id, content=user_message, chain=chain, cancel_event=cancel_event):
                    await websocket.send_text(json.dumps({"role": "bot", "content": token}))
                    bot_response += token

                crud.chat.save_message(db, user_id=user.id, chat_message = schemas.ChatMessage(role="bot",content=bot_response))

        except WebSocketDisconnect:
            cancel_event.set()
            print("Client disconnected")
    finally:
        db_gen.close()


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

