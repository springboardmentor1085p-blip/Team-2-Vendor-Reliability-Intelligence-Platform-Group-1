from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.vendor import VendorCategory, VendorStatus


class VendorCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    category: VendorCategory
    contact_person: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[VendorCategory] = None
    contact_person: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    status: Optional[VendorStatus] = None


class VendorOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    category: VendorCategory
    status: VendorStatus
    contact_person: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    reliability_score: float
    created_at: datetime

    class Config:
        from_attributes = True


class VendorDetail(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    category: str
    status: str
    contact_person: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    reliability_score: float
    created_at: datetime
    total_orders: int
    total_spend: float
    on_time_rate: float
    total_deliveries: int
    approved_by: Optional[int] = None

    class Config:
        from_attributes = True


class VendorStats(BaseModel):
    total: int
    approved: int
    pending: int
    suspended: int
    rejected: int
    by_category: dict
