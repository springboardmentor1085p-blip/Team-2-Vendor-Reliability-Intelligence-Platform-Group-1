from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import BaseModel


class Communication(BaseModel):
    __tablename__ = "communications"

    vendor_id = Column(ForeignKey("vendors.id"), nullable=False)

    communication_type = Column(String(100), nullable=False)

    subject = Column(String(255), nullable=False)

    message = Column(String(2000), nullable=False)

    communication_date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    status = Column(
        String(50),
        default="Sent",
    )

    vendor = relationship("Vendor")