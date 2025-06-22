from fastapi import APIRouter, Depends, Request, HTTPException, WebSocket, WebSocketDisconnect
from app.core.config import settings
from app import crud, models
from sqlalchemy.orm import Session
from app.api import deps
from app import schemas
from app.core.llm import get_langchain_chain, stream_bot_response_async, get_demo_langchain_chain
import json
import asyncio
import traceback
from app.vector.vector_crud import store_chat_summary,clear_user_summaries
from fastapi import BackgroundTasks
from datetime import datetime

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

        chain = get_langchain_chain(db=db, user_id=user.id)
        cancel_event = asyncio.Event()
        
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    message_data = json.loads(data)
                    user_message = message_data.get("content", "")
                    message_type = message_data.get("type", "text")
                    if message_type == "stop":
                        cancel_event.set()
                        await websocket.send_text(json.dumps({
                            "type": "stream_stop",
                            "role": "bot",
                            "message": "Streaming stopped by user."
                        }))
                        print("Streaming stopped by user.")
                        continue
                    elif message_type == "text":
                        cancel_event.clear()

                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({"error": "Invalid JSON format"}))
                    continue

                # Save user message
                crud.chat.save_message(db, user_id=user.id, chat_message=schemas.ChatMessage(role="user", content=user_message))
                
                session_id = f"{user.id}-{websocket.client.host}-{websocket.client.port}"
                bot_response = ""
                
                try:
                    await websocket.send_text(json.dumps({
                        "type": "stream_start",
                        "role": "bot",
                        "datetime": datetime.now().isoformat(),
                    }))

                    print("Using async callback streaming")
                    async for token in stream_bot_response_async(
                        content=user_message, 
                        chain=chain, 
                        session_id=session_id, 
                        cancel_event=cancel_event
                    ):
                        if cancel_event.is_set():
                            break
                        
                        await websocket.send_text(json.dumps({
                            "type": "stream_token",
                            "role": "bot", 
                            "content": token
                        }))
                        
                        bot_response += token
                        await asyncio.sleep(0)  # Yield control
                    
                    # Send end indicator
                    await websocket.send_text(json.dumps({
                        "type": "stream_end",
                        "role": "bot",
                        "total_length": len(bot_response)
                    }))
                    
                    # Save complete bot response
                    if bot_response.strip():  # Only save if we got a response
                        crud.chat.save_message(db, user_id=user.id, chat_message=schemas.ChatMessage(role="bot", content=bot_response))
                    
                except Exception as streaming_error:
                    print(f"Streaming error: {streaming_error}")
                    print(f"Traceback: {traceback.format_exc()}")
                    
                    # Send error to client
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "error": f"Streaming failed: {str(streaming_error)}"
                    }))

        except WebSocketDisconnect:
            cancel_event.set()
            print("Client disconnected")
        except Exception as e:
            print(f"WebSocket error: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            try:
                await websocket.send_text(json.dumps({
                    "type": "error", 
                    "error": str(e)
                }))
            except:
                pass  # Connection might be closed
                
    finally:
        try:
            db_gen.close()
        except:
            pass


@router.post("/clear-chat")
async def clear_chat_history(
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    user: models.User = Depends(deps.get_current_user)
):
    history = schemas.ChatHistoryResponse(chat_history=crud.chat.get_chat_history(db, user_id=user.id) or [])

    if history:
        history_messages = [
            {"role": msg.role, "content": msg.content, "user_id": msg.user_id}
            for msg in history.chat_history
        ]
        # Move this to background
        background_tasks.add_task(store_chat_summary, user.id, history_messages)

    crud.chat.clear_chat_history(db, user_id=user.id)

    return {"message": "Chat history is being cleared and summarized in background."}


@router.post("/clear-memories")
async def clear_memories(
    db: Session = Depends(deps.get_db),
    user: models.User = Depends(deps.get_current_user)
):
    """
    Clear all chat memories for the authenticated user.
    """
    try:
        clear_user_summaries(user_id=user.id)
        return {"message": "Chat memories cleared successfully."}
    except Exception as e:
        print(f"Error clearing memories: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear chat memories.")



@router.websocket("/ws/demo-chat")
async def chat_websocket(websocket: WebSocket):
    db_gen = deps.get_db()
    db = next(db_gen)
    try:
        await websocket.accept()
        # For demo, we do not use a database session or user object
        demo_user_id = f"guest-{websocket.client.host}-{websocket.client.port}"
        chain = get_demo_langchain_chain()
        cancel_event = asyncio.Event()
        
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    message_data = json.loads(data)
                    user_message = message_data.get("content", "")
                    message_type = message_data.get("type", "text")
                    if message_type == "stop":
                        cancel_event.set()
                        await websocket.send_text(json.dumps({
                            "type": "stream_stop",
                            "role": "bot",
                            "message": "Streaming stopped by user."
                        }))
                        print("Streaming stopped by user.")
                        continue
                    elif message_type == "text":
                        cancel_event.clear()

                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({"error": "Invalid JSON format"}))
                    continue

                session_id = demo_user_id
                bot_response = ""
                
                try:
                    await websocket.send_text(json.dumps({
                        "type": "stream_start",
                        "role": "bot",
                        "datetime": datetime.now().isoformat(),
                    }))

                    print("Using async callback streaming")
                    async for token in stream_bot_response_async(
                        content=user_message, 
                        chain=chain, 
                        session_id=session_id, 
                        cancel_event=cancel_event
                    ):
                        if cancel_event.is_set():
                            break
                        
                        await websocket.send_text(json.dumps({
                            "type": "stream_token",
                            "role": "bot", 
                            "content": token
                        }))
                        
                        bot_response += token
                        await asyncio.sleep(0)  # Yield control
                    
                    # Send end indicator
                    await websocket.send_text(json.dumps({
                        "type": "stream_end",
                        "role": "bot",
                        "total_length": len(bot_response)
                    }))
                    
                except Exception as streaming_error:
                    print(f"Streaming error: {streaming_error}")
                    print(f"Traceback: {traceback.format_exc()}")
                    
                    # Send error to client
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "error": f"Streaming failed: {str(streaming_error)}"
                    }))

        except WebSocketDisconnect:
            cancel_event.set()
            print("Client disconnected")
        except Exception as e:
            print(f"WebSocket error: {e}")
            print(f"Traceback: {traceback.format_exc()}")

            await websocket.send_text(json.dumps({
                "type": "error", 
                "error": str(e)
            }))
    finally:
        try:
            db_gen.close()
        except:
            pass