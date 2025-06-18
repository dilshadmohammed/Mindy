from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: int
    name: str
    email: str
    sub: Optional[str] = None
    picture: Optional[str] = None

    class Config:
        from_attributes = True
