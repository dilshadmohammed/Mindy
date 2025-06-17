from sqlalchemy import Column, Integer, String
from app.db.base import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False) 
    content = Column(String, nullable=False) 
    user_id = Column(Integer, nullable=False)