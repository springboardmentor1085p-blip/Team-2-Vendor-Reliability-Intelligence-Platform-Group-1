from pydantic import BaseModel, EmailStr
from typing import Optional


class VendorCreate(BaseModel):
    vendor_name: str
    company_name: str
    email: EmailStr
    phone: str
    address: str
    category: str


class VendorUpdate(BaseModel):
    vendor_name: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


class VendorResponse(BaseModel):
    id: int
    vendor_name: str
    company_name: str
    email: EmailStr
    phone: str
    address: str
    category: str
    status: str
    is_active: bool

    class Config:
        from_attributes = True