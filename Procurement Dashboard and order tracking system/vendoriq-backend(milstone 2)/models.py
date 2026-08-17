from sqlalchemy import (
    Column, Integer, String, DateTime, Numeric,
    ForeignKey, CheckConstraint, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


# ── Status enum ───────────────────────────────────────────────────────────────

class POStatus(str, enum.Enum):
    pending   = "pending"
    approved  = "approved"
    shipped   = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class Vendor(Base):
    __tablename__ = "vendors"

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'approved', 'rejected')",
            name="ck_vendor_status"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # One vendor -> many purchase orders
    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")


class PurchaseOrder(Base):
    """
    ORM model for the purchase_orders table (Member 2 — Procurement Dashboard).

    Tracks every purchase order raised against a vendor, from creation through
    to delivery or cancellation.
    """
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)

    # Human-readable PO reference, e.g. "PO-2026-0001" — unique across the table
    po_number = Column(String(50), unique=True, nullable=False, index=True)

    # Foreign key to the vendors table — RESTRICT prevents deleting a vendor
    # that still has open purchase orders
    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Order line details
    item_description = Column(String(500),    nullable=False)
    quantity         = Column(Integer,        nullable=False)
    unit_price       = Column(Numeric(12, 2), nullable=False)
    total_amount     = Column(Numeric(12, 2), nullable=False)

    # Lifecycle status — stored as a native PostgreSQL enum for data integrity
    status = Column(
        SAEnum(POStatus, name="po_status_enum", create_type=True),
        nullable=False,
        default=POStatus.pending,
        index=True,
    )

    order_date             = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    expected_delivery_date = Column(DateTime(timezone=True), nullable=True)
    created_at             = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at             = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Many purchase orders -> one vendor (RESTRICT on delete keeps referential integrity)
    vendor = relationship("Vendor", back_populates="purchase_orders")
