import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic import ConfigDict
from datetime import datetime
from typing import Optional


class VendorCreate(BaseModel):
    """Schema for creating a new vendor. Accepts camelCase from the frontend form."""

    vendorName: str = Field(..., min_length=3, max_length=100, description="Vendor's business name")
    email: EmailStr = Field(..., description="Vendor's unique email address")
    phone: Optional[str] = Field(None, max_length=20, description="10-digit phone number")
    address: Optional[str] = Field(None, min_length=10, max_length=500, description="Vendor's address")

    @field_validator("vendorName")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Vendor name must not be blank or whitespace only")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def phone_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        cleaned = v.strip()
        if not re.fullmatch(r"[0-9]{10}", cleaned):
            raise ValueError("Phone number must be exactly 10 digits")
        return cleaned

    @field_validator("address")
    @classmethod
    def address_must_not_be_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip()
        if not stripped:
            return None
        return stripped


class VendorUpdate(BaseModel):
    """
    Schema for updating an existing vendor.
    All fields are optional — only the fields you send will be updated.
    """

    vendorName: Optional[str] = Field(None, min_length=3, max_length=100)
    email: Optional[EmailStr] = Field(None)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, min_length=10, max_length=500)
    status: Optional[str] = Field(None)

    @field_validator("vendorName")
    @classmethod
    def name_must_not_be_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not v.strip():
            raise ValueError("Vendor name must not be blank or whitespace only")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def phone_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        cleaned = v.strip()
        if not re.fullmatch(r"[0-9]{10}", cleaned):
            raise ValueError("Phone number must be exactly 10 digits")
        return cleaned

    @field_validator("status")
    @classmethod
    def status_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {"pending", "approved", "rejected"}
        if v not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(allowed)}")
        return v


class VendorResponse(BaseModel):
    """Schema for returning vendor data in API responses."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    # 'name' is the ORM attribute; validation_alias reads from 'name' on the ORM object
    # but serializes out as 'vendorName' in the JSON response (the field name is used)
    vendorName: str = Field(validation_alias="name")
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
