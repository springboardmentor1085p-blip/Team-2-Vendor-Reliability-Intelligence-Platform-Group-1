from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
import enum
from app.database import Base


class NotificationType(str, enum.Enum):
    PROCUREMENT_ALERT = "procurement_alert"
    DELIVERY_DELAY = "delivery_delay"
    VENDOR_APPROVAL = "vendor_approval"
    CONTRACT_EXPIRY = "contract_expiry"
    COMPLIANCE = "compliance"
    GENERAL = "general"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # None = broadcast
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.GENERAL)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
