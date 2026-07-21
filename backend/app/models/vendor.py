from sqlalchemy import Boolean, Column, String

from app.models.base import BaseModel


class Vendor(BaseModel):
    __tablename__ = "vendors"

    vendor_name = Column(String(150), nullable=False)
    company_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=False)
    address = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    status = Column(String(50), default="Active")
    is_active = Column(Boolean, default=True)
    from pydantic import BaseModel


class VendorApprovalResponse(BaseModel):
    message: str
    vendor_id: int
    status: str