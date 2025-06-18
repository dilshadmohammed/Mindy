from sqlalchemy.orm import Session
from app import models, schemas

def get_chat_history(db: Session, user_id: int):
    try:
        return db.query(models.ChatMessage).filter(models.ChatMessage.user_id == user_id).all()
    except Exception as e:
        # Optionally log the exception here
        return []

def create_chat_message(db: Session, user_id: int, chat_message: schemas.ChatMessage):
    try:
        new_message = models.ChatMessage(
            role=chat_message.role,
            content=chat_message.content,
            user_id=user_id
        )
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        return new_message
    except Exception as e:
        db.rollback()
        # Optionally log the exception here
        return None

def clear_chat_history(db: Session, user_id: int):
    try:
        db.query(models.ChatMessage).filter(models.ChatMessage.user_id == user_id).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        # Optionally log the exception here
        return False
    return True    