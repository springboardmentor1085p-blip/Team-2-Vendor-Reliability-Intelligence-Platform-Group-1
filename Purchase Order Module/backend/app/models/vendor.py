import enum
from sqlalchemy import Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class VendorCategory(str, enum.Enum):
    RAW_MATERIAL = "Raw Material Supplier"
    EQUIPMENT    = "Equipment Vendor"
    IT           = "IT Vendor"
    SERVICE      = "Service Provider"
    LOGISTICS    = "Logistics Partner"
    MAINTENANCE  = "Maintenance Vendor"


class VendorStatus(str, enum.Enum):
    PENDING     = "Pending"
    APPROVED    = "Approved"
    SUSPENDED   = "Suspended"
    BLACKLISTED = "Blacklisted"


class Vendor(Base):
    __tablename__ = "vendors"

    id                  = Column(Integer, primary_key=True, index=True)
    vendor_code         = Column(String(20), unique=True, index=True, nullable=False)
    company_name        = Column(String(255), nullable=False)
    contact_person      = Column(String(150))
    email               = Column(String(255), unique=True, index=True, nullable=False)
    phone               = Column(String(30))
    address             = Column(Text)
    category            = Column(Enum(VendorCategory), nullable=False)
    status              = Column(Enum(VendorStatus), default=VendorStatus.PENDING, nullable=False)
    registration_number = Column(String(100))
    tax_id              = Column(String(100))
    website             = Column(String(255))
    notes               = Column(Text)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), onupdate=func.now())

    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")
