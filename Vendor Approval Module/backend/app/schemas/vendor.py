from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from app.models.vendor import VendorCategory, VendorStatus


class VendorCreate(BaseModel):
    company_name: str
    contact_person: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    category: VendorCategory
    description: Optional[str] = None
    registration_number: Optional[str] = None
    tax_id: Optional[str] = None


class VendorUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[VendorCategory] = None
    description: Optional[str] = None
    registration_number: Optional[str] = None
    tax_id: Optional[str] = None


class VendorStatusUpdate(BaseModel):
    """Payload for changing a vendor's status — Manager/Admin only."""
    status: VendorStatus
    remarks: Optional[str] = None


class StatusHistoryOut(BaseModel):
    id: int
    old_status: Optional[VendorStatus]
    new_status: VendorStatus
    changed_by: int
    changed_by_name: Optional[str] = None
    remarks: Optional[str]
    changed_at: datetime

    class Config:
        from_attributes = True


class VendorOut(BaseModel):
    id: int
    company_name: str
    contact_person: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    category: VendorCategory
    status: VendorStatus
    description: Optional[str]
    registration_number: Optional[str]
    tax_id: Optional[str]
    registered_by: Optional[int]
    reviewed_by: Optional[int]
    created_at: datetime
    updated_at: datetime
    status_history: List[StatusHistoryOut] = []

    class Config:
        from_attributes = True


class VendorListOut(BaseModel):
    id: int
    company_name: str
    contact_person: str
    email: str
    category: VendorCategory
    status: VendorStatus
    created_at: datetime

    class Config:
        from_attributes = True
