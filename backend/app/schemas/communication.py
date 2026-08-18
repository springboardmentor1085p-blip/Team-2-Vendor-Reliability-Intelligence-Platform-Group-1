from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CommunicationCreate(BaseModel):
    vendor_id: int
    subject: str
    message: str
    communication_type: str


class CommunicationUpdate(BaseModel):
    subject: Optional[str] = None
    message: Optional[str] = None
    communication_type: Optional[str] = None
    status: Optional[str] = None


class CommunicationResponse(BaseModel):
    id: int
    vendor_id: int
    subject: str
    message: str
    communication_type: str
    status: str
    communication_date: datetime

    class Config:
        from_attributes = True