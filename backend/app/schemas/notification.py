from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NotificationBase(BaseModel):
    title: str
    message: str
    recipient: str
    notification_type: str
    status: Optional[str] = "Unread"


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    recipient: Optional[str] = None
    notification_type: Optional[str] = None
    status: Optional[str] = None


class NotificationResponse(NotificationBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)