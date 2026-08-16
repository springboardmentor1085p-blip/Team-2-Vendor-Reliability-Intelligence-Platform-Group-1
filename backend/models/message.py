from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from database.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    sender_id = Column(Integer, ForeignKey("users.id"))

    receiver_id = Column(Integer, ForeignKey("users.id"))

    message = Column(String, nullable=False)

    timestamp = Column(DateTime, default=datetime.utcnow)

    is_read = Column(Boolean, default=False)