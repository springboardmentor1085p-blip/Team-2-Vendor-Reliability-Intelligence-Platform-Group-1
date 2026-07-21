from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CommunicationCreate(BaseModel):
    vendor_id: int
    communication_type: str
    subject: str
    message: str


class CommunicationUpdate(BaseModel):
    communication_type: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None


class CommunicationResponse(BaseModel):
    id: int
    vendor_id: int
    communication_type: str
    subject: str
    message: str
    communication_date: datetime
    status: str

    class Config:
        from_attributes = True