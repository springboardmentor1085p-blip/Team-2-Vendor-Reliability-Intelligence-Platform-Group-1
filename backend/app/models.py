from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


# -----------------------------
# Purchase Order
# -----------------------------
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String)
    target_date = Column(Date)
    status = Column(String)

    notifications = relationship(
        "Notification",
        back_populates="purchase_order"
    )
    audit_logs = relationship( 
        "PurchaseOrderAudit", 
        backref="purchase_order", 
        cascade="all, delete-orphan" 
    )

from sqlalchemy import DateTime
from datetime import datetime

class PurchaseOrderAudit(Base):
    __tablename__ = "purchase_order_audit"

    id = Column(Integer, primary_key=True, index=True)

    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"))

    action = Column(String)   # CREATED, UPDATED, APPROVED, REJECTED, DELIVERED

    old_status = Column(String, nullable=True)

    new_status = Column(String)

    changed_by = Column(String, default="System")

    changed_at = Column(DateTime, default=datetime.utcnow)

# -----------------------------
# Notification
# -----------------------------
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)

    purchase_order_id = Column(
        Integer,
        ForeignKey("purchase_orders.id")
    )

    title = Column(String)
    message = Column(String)
    is_read = Column(Boolean, default=False)

    purchase_order = relationship(
        "PurchaseOrder",
        back_populates="notifications"
    )


# -----------------------------
# Items
# -----------------------------
class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(
        Integer,
        ForeignKey("purchase_orders.id")
    )
    item_name = Column(String)
    quantity = Column(Integer)


# -----------------------------
# Notification Preferences
# -----------------------------
class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True)

    email_notifications = Column(Boolean, default=True)
    system_notifications = Column(Boolean, default=True)


# -----------------------------
# Contract
# -----------------------------
class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String)
    expiry_date = Column(Date)