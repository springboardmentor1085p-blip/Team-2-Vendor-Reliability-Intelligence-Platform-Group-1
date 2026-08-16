from pydantic import BaseModel
from datetime import datetime


class MessageCreate(BaseModel):
    sender_id: int
    receiver_id: int
    message: str


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    message: str
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True