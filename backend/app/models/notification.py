from sqlalchemy import Column, String

from app.models.base import BaseModel


class Notification(BaseModel):
    __tablename__ = "notifications"

    title = Column(
        String(255),
        nullable=False,
    )

    message = Column(
        String(2000),
        nullable=False,
    )

    recipient = Column(
        String(150),
        nullable=False,
    )

    notification_type = Column(
        String(50),
        nullable=False,
    )

    status = Column(
        String(50),
        default="Unread",
    )