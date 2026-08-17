from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text,
    ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


# ── Existing models (Milestone 1 & 2) ────────────────────────────────────────

class POStatus(str, enum.Enum):
    pending   = "pending"
    approved  = "approved"
    shipped   = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class Vendor(Base):
    __tablename__ = "vendors"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(255), unique=True, nullable=False, index=True)
    phone      = Column(String(20), nullable=True)
    address    = Column(String(500), nullable=True)
    status     = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id                     = Column(Integer, primary_key=True, index=True)
    po_number              = Column(String(50), unique=True, nullable=False, index=True)
    vendor_id              = Column(Integer, ForeignKey("vendors.id", ondelete="RESTRICT"), nullable=False, index=True)
    item_description       = Column(String(500), nullable=False)
    quantity               = Column(Integer, nullable=False)
    unit_price             = Column(__import__("sqlalchemy").Numeric(12, 2), nullable=False)
    total_amount           = Column(__import__("sqlalchemy").Numeric(12, 2), nullable=False)
    status                 = Column(SAEnum(POStatus, name="po_status_enum", create_type=True), nullable=False, default=POStatus.pending, index=True)
    order_date             = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    expected_delivery_date = Column(DateTime(timezone=True), nullable=True)
    created_at             = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at             = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    vendor = relationship("Vendor", back_populates="purchase_orders")


# ── NEW in Milestone 3 — Notification models ──────────────────────────────────

class NotificationChannelEnum(str, enum.Enum):
    email  = "email"
    in_app = "in_app"


class NotificationStatusEnum(str, enum.Enum):
    pending = "pending"
    sent    = "sent"
    failed  = "failed"
    skipped = "skipped"


class NotificationPreference(Base):
    """
    Stores per-user notification channel preferences.
    Maps to the existing `notification_preferences` PostgreSQL table.
    """
    __tablename__ = "notification_preferences"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, nullable=False, unique=True, index=True)
    email_enabled   = Column(Boolean, nullable=False, default=True)
    in_app_enabled  = Column(Boolean, nullable=False, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)


class NotificationQueue(Base):
    """
    Queue of notifications pending delivery or already sent/failed.
    Maps to the existing `notification_queue` PostgreSQL table.
    """
    __tablename__ = "notification_queue"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, nullable=False, index=True)
    message    = Column(Text, nullable=False)
    status     = Column(
        SAEnum(NotificationStatusEnum, name="notification_status_enum", create_type=True),
        nullable=False,
        default=NotificationStatusEnum.pending,
        index=True,
    )
    channel    = Column(
        SAEnum(NotificationChannelEnum, name="notification_channel_enum", create_type=True),
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    sent_at    = Column(DateTime(timezone=True), nullable=True)


# ── NEW in Milestone 3 — Export Job model ─────────────────────────────────────

class ExportTypeEnum(str, enum.Enum):
    vendors         = "vendors"
    purchase_orders = "purchase_orders"
    analytics       = "analytics"


class ExportStatusEnum(str, enum.Enum):
    pending    = "pending"
    processing = "processing"
    completed  = "completed"
    failed     = "failed"


class ExportJob(Base):
    """
    Tracks the lifecycle of a background data-export request.
    Maps to the `export_jobs` PostgreSQL table.
    """
    __tablename__ = "export_jobs"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, nullable=False, index=True)
    export_type   = Column(
        SAEnum(ExportTypeEnum, name="export_type_enum", create_type=True),
        nullable=False,
        index=True,
    )
    status        = Column(
        SAEnum(ExportStatusEnum, name="export_status_enum", create_type=True),
        nullable=False,
        default=ExportStatusEnum.pending,
        index=True,
    )
    file_path     = Column(String(500), nullable=True)
    requested_at  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at  = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
