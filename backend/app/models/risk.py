from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Risk(BaseModel):
    __tablename__ = "vendor_risks"

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    vendor_id = Column(
        ForeignKey("vendors.id"),
        nullable=False,
    )

    risk_type = Column(
        String(100),
        nullable=False,
    )

    severity = Column(
        String(50),
        nullable=False,
    )

    description = Column(
        String,
        nullable=True,
    )

    impact_score = Column(
        Integer,
        nullable=False,
    )

    status = Column(
        String(50),
        nullable=False,
        default="Open",
    )

    vendor = relationship("Vendor")
