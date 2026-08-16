import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class POStatus(str, enum.Enum):
    PENDING    = "Pending"
    APPROVED   = "Approved"
    DISPATCHED = "Dispatched"
    DELIVERED  = "Delivered"
    COMPLETED  = "Completed"
    CANCELLED  = "Cancelled"


class POPriority(str, enum.Enum):
    LOW      = "Low"
    MEDIUM   = "Medium"
    HIGH     = "High"
    CRITICAL = "Critical"


class PurchaseOrder(Base):
    """PO ID format: PO-YYYYMM-XXXXXX  e.g. PO-202507-000001"""
    __tablename__ = "purchase_orders"

    id          = Column(Integer, primary_key=True, index=True)
    po_number   = Column(String(25), unique=True, index=True, nullable=False)
    vendor_id   = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    created_by  = Column(Integer, ForeignKey("users.id"),   nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"),   nullable=True)

    title       = Column(String(255), nullable=False)
    description = Column(Text)
    priority    = Column(Enum(POPriority), default=POPriority.MEDIUM, nullable=False)
    status      = Column(Enum(POStatus),   default=POStatus.PENDING,  nullable=False, index=True)

    subtotal        = Column(Numeric(15, 2), default=0)
    tax_rate        = Column(Numeric(5,  2), default=0)
    tax_amount      = Column(Numeric(15, 2), default=0)
    discount_amount = Column(Numeric(15, 2), default=0)
    total_amount    = Column(Numeric(15, 2), default=0)
    currency        = Column(String(10), default="USD")

    required_date          = Column(DateTime(timezone=True), nullable=True)
    expected_delivery_date = Column(DateTime(timezone=True), nullable=True)
    actual_delivery_date   = Column(DateTime(timezone=True), nullable=True)
    approved_at            = Column(DateTime(timezone=True), nullable=True)
    dispatched_at          = Column(DateTime(timezone=True), nullable=True)
    delivered_at           = Column(DateTime(timezone=True), nullable=True)

    delivery_address = Column(Text)
    shipping_method  = Column(String(100))
    tracking_number  = Column(String(100))
    internal_notes   = Column(Text)
    vendor_notes     = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    vendor           = relationship("Vendor", back_populates="purchase_orders")
    created_by_user  = relationship("User", back_populates="purchase_orders",  foreign_keys=[created_by])
    approved_by_user = relationship("User", back_populates="approved_orders",  foreign_keys=[approved_by])
    items            = relationship("POItem", back_populates="purchase_order", cascade="all, delete-orphan")
    status_history   = relationship("POStatusHistory", back_populates="purchase_order",
                                    cascade="all, delete-orphan", order_by="POStatusHistory.changed_at")


class POItem(Base):
    __tablename__ = "po_items"

    id                = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    item_code         = Column(String(50))
    item_name         = Column(String(255), nullable=False)
    description       = Column(Text)
    quantity          = Column(Numeric(12, 3), nullable=False)
    unit              = Column(String(50), default="pcs")
    unit_price        = Column(Numeric(15, 2), nullable=False)
    total_price       = Column(Numeric(15, 2), nullable=False)
    notes             = Column(Text)
    created_at        = Column(DateTime(timezone=True), server_default=func.now())

    purchase_order = relationship("PurchaseOrder", back_populates="items")


class POStatusHistory(Base):
    __tablename__ = "po_status_history"

    id                = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    changed_by        = Column(Integer, ForeignKey("users.id"), nullable=True)
    previous_status   = Column(Enum(POStatus), nullable=True)
    new_status        = Column(Enum(POStatus), nullable=False)
    remarks           = Column(Text)
    changed_at        = Column(DateTime(timezone=True), server_default=func.now())

    purchase_order  = relationship("PurchaseOrder", back_populates="status_history")
    changed_by_user = relationship("User", foreign_keys=[changed_by])
