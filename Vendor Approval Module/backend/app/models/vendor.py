import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class VendorCategory(str, enum.Enum):
    RAW_MATERIAL = "raw_material_supplier"
    EQUIPMENT = "equipment_vendor"
    IT = "it_vendor"
    SERVICE = "service_provider"
    LOGISTICS = "logistics_partner"
    MAINTENANCE = "maintenance_vendor"


class VendorStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    SUSPENDED = "suspended"
    REJECTED = "rejected"


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    contact_person = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50))
    address = Column(Text)
    category = Column(SAEnum(VendorCategory), nullable=False)
    status = Column(SAEnum(VendorStatus), default=VendorStatus.PENDING, nullable=False)
    description = Column(Text)
    registration_number = Column(String(100))
    tax_id = Column(String(100))

    # FK to the user who registered this vendor
    registered_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    # FK to the manager who last changed the status
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    status_history = relationship("VendorStatusHistory", back_populates="vendor",
                                  cascade="all, delete-orphan")


class VendorStatusHistory(Base):
    """Audit trail for every vendor status change."""
    __tablename__ = "vendor_status_history"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    old_status = Column(SAEnum(VendorStatus), nullable=True)
    new_status = Column(SAEnum(VendorStatus), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    remarks = Column(Text)
    changed_at = Column(DateTime, default=datetime.utcnow)

    vendor = relationship("Vendor", back_populates="status_history")
    changed_by_user = relationship("User", foreign_keys=[changed_by])
