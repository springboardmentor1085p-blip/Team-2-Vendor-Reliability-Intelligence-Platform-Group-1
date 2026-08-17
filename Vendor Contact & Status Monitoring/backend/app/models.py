from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from .database import Base


class Vendor(Base):
    __tablename__ = "vendor"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=False)
    category = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False, default="Active")
    reliability_score = Column(Integer, nullable=False, default=85)

    contacts = relationship("VendorContact", back_populates="vendor")


class VendorContact(Base):
    __tablename__ = "vendor_contact"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendor.id"), nullable=False, index=True)
    contact_name = Column(String(150), nullable=False)
    designation = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(30), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    vendor = relationship("Vendor", back_populates="contacts")
