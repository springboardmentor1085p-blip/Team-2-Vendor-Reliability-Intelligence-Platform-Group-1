from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text

from database import Base


class ReliabilityScore(Base):
    __tablename__ = "reliability_scores"

    id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    quality_score = Column(
        Float,
        nullable=False
    )

    delivery_score = Column(
        Float,
        nullable=False
    )

    compliance_score = Column(
        Float,
        nullable=False
    )

    communication_score = Column(
        Float,
        nullable=False
    )

    reliability_score = Column(
        Float,
        nullable=False
    )

    status = Column(
        String(50),
        nullable=False
    )

    risk_level = Column(
        String(50),
        nullable=False
    )

    recommendation = Column(
        Text,
        nullable=False
    )

    calculated_at = Column(
        DateTime,
        default=datetime.now,
        nullable=False
    )


class ReliabilityNotification(Base):
    __tablename__ = "reliability_notifications"

    id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    message = Column(
        Text,
        nullable=False
    )

    notification_type = Column(
        String(30),
        nullable=False
    )

    is_read = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.now,
        nullable=False
    )