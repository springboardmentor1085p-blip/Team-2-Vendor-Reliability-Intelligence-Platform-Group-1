from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.vendor import VendorCategory, VendorStatus


class VendorCreate(BaseModel):
    company_name:        str
    contact_person:      Optional[str] = None
    email:               EmailStr
    phone:               Optional[str] = None
    address:             Optional[str] = None
    category:            VendorCategory
    registration_number: Optional[str] = None
    tax_id:              Optional[str] = None
    website:             Optional[str] = None
    notes:               Optional[str] = None


class VendorUpdate(BaseModel):
    company_name:        Optional[str]            = None
    contact_person:      Optional[str]            = None
    phone:               Optional[str]            = None
    address:             Optional[str]            = None
    category:            Optional[VendorCategory] = None
    status:              Optional[VendorStatus]   = None
    registration_number: Optional[str]            = None
    tax_id:              Optional[str]            = None
    website:             Optional[str]            = None
    notes:               Optional[str]            = None


class VendorOut(BaseModel):
    id:                  int
    vendor_code:         str
    company_name:        str
    contact_person:      Optional[str]
    email:               str
    phone:               Optional[str]
    address:             Optional[str]
    category:            VendorCategory
    status:              VendorStatus
    registration_number: Optional[str]
    tax_id:              Optional[str]
    website:             Optional[str]
    notes:               Optional[str]
    created_at:          datetime

    class Config:
        from_attributes = True
