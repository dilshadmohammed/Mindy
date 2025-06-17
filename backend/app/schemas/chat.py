from pydantic import BaseModel
from typing import Optional

class ChatMessage(BaseModel):
    id: Optional[int] = None
    role: str
    content: str
    user_id: Optional[int] = None

    class Config:
        orm_mode = True
        from_attributes=True


class ChatMessageResponse(BaseModel):
    message: ChatMessage                    

class ChatHistoryResponse(BaseModel):
    chat_history: list[ChatMessage]

    class Config:
        orm_mode = True
        use_enum_values = True
        arbitrary_types_allowed = True
        json_encoders = {
            str: lambda v: v,
            int: lambda v: v,
            float: lambda v: v,
            bool: lambda v: v,
        }       
