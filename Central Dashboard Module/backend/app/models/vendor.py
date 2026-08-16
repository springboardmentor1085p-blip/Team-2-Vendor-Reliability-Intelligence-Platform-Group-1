import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class VendorCategory(str, enum.Enum):
    RAW_MATERIAL = "raw_material"
    EQUIPMENT = "equipment"
    IT = "it"
    SERVICE = "service"
    LOGISTICS = "logistics"
    MAINTENANCE = "maintenance"


class VendorStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    SUSPENDED = "suspended"
    REJECTED = "rejected"
    INACTIVE = "inactive"


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(50))
    address = Column(Text)
    category = Column(Enum(VendorCategory), nullable=False)
    status = Column(Enum(VendorStatus), default=VendorStatus.PENDING)
    contact_person = Column(String(255))
    website = Column(String(255))
    tax_id = Column(String(100))
    reliability_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # relationships
    performance_records = relationship("VendorPerformance", back_populates="vendor", lazy="dynamic")
    delivery_records = relationship("DeliveryRecord", back_populates="vendor", lazy="dynamic")
    contracts = relationship("Contract", back_populates="vendor", lazy="dynamic")
    purchase_orders = relationship("PurchaseOrder", back_populates="vendor", lazy="dynamic")
