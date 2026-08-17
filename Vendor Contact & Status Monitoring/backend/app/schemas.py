from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class VendorContactBase(BaseModel):
    contact_name: str
    designation: str
    email: str
    phone: str

    @field_validator("contact_name")
    @classmethod
    def validate_contact_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("contact_name must contain at least 2 characters")
        return value

    @field_validator("designation")
    @classmethod
    def validate_designation(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("designation must contain at least 2 characters")
        return value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value:
            raise ValueError("email must be a valid email address")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 7:
            raise ValueError("phone must contain at least 7 digits")
        return value


class VendorContactCreate(VendorContactBase):
    pass


class VendorContactUpdate(BaseModel):
    contact_name: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

    @field_validator("contact_name")
    @classmethod
    def validate_contact_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if len(value) < 2:
            raise ValueError("contact_name must contain at least 2 characters")
        return value

    @field_validator("designation")
    @classmethod
    def validate_designation(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if len(value) < 2:
            raise ValueError("designation must contain at least 2 characters")
        return value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip().lower()
        if "@" not in value or "." not in value:
            raise ValueError("email must be a valid email address")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if len(value) < 7:
            raise ValueError("phone must contain at least 7 digits")
        return value


class VendorContactResponse(VendorContactBase):
    id: int
    vendor_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VendorProfileResponse(BaseModel):
    id: int
    name: str
    code: str
    category: Optional[str] = None
    status: str
    reliability_score: int


class VendorStatusResponse(BaseModel):
    vendor_id: int
    status: str
    reliability_score: int
    last_verified_at: datetime
