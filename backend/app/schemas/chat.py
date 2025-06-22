from pydantic import BaseModel, Field, model_validator
from typing import Optional, Union, Any
from datetime import datetime

class ChatMessage(BaseModel):
    id: Optional[int] = None
    role: str
    content: str
    user_id: Optional[int] = None
    datetime: datetime

    class Config:
        from_attributes = True

    @model_validator(mode="before")
    def set_datetime(cls, values):
        if isinstance(values, dict):
            if values.get("datetime") is None:
                values["datetime"] = datetime.now()
        else:
            if getattr(values, "datetime", None) is None:
                setattr(values, "datetime", datetime.now())
        return values

class ChatMessageCreateRequest(BaseModel):
    content: str

class ChatMessageResponse(BaseModel):
    message: ChatMessage                    

class ChatHistoryResponse(BaseModel):
    chat_history: list[ChatMessage]

    class Config:
        from_attributes = True
        use_enum_values = True
        arbitrary_types_allowed = True
        json_encoders = {
            str: lambda v: v,
            int: lambda v: v,
            float: lambda v: v,
            bool: lambda v: v,
        }       
