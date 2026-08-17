import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic import ConfigDict
from datetime import datetime, date
from decimal import Decimal
from typing import Optional

# ── Import enum at the top to avoid mid-file circular-import issues ───────────
from models import POStatus


# ── Vendor schemas (unchanged from Milestone 1) ───────────────────────────────

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
    vendorName: str = Field(validation_alias="name")
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None


# ── Purchase Order schemas (Milestone 2 — Member 2) ──────────────────────────


class VendorInPO(BaseModel):
    """Vendor snapshot embedded inside every PO response — read-only join."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    vendor_name: str = Field(validation_alias="name")
    email: str
    status: str


class POCreate(BaseModel):
    """Request body for POST /purchase-orders — create a new purchase order."""

    vendor_id:             int            = Field(..., gt=0, description="ID of an existing vendor")
    po_number:             str            = Field(..., min_length=1, max_length=50,  description="Unique PO reference, e.g. PO-2026-0001")
    item_description:      str            = Field(..., min_length=3, max_length=500, description="What is being ordered")
    quantity:              int            = Field(..., gt=0,         description="Number of units (must be > 0)")
    unit_price:            Decimal        = Field(..., gt=0,         description="Price per unit (must be > 0)")
    total_amount:          Decimal        = Field(..., gt=0,         description="quantity × unit_price")
    order_date:            Optional[datetime] = Field(None,          description="Defaults to now() if omitted")
    expected_delivery_date: Optional[datetime] = Field(None,         description="Expected delivery (optional)")

    @field_validator("po_number")
    @classmethod
    def po_number_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("po_number must not be blank")
        return v.strip().upper()

    @field_validator("total_amount")
    @classmethod
    def total_must_match(cls, v: Decimal, info) -> Decimal:
        qty = info.data.get("quantity")
        unit = info.data.get("unit_price")
        if qty is not None and unit is not None:
            expected = Decimal(str(qty)) * unit
            if abs(v - expected) > Decimal("0.01"):
                raise ValueError(
                    f"total_amount ({v}) does not match quantity × unit_price ({expected})"
                )
        return v


class POUpdate(BaseModel):
    """
    Request body for PUT /purchase-orders/{id}.
    All fields optional — only supplied fields are updated.
    """

    status:                Optional[POStatus]  = Field(None, description="New lifecycle status")
    item_description:      Optional[str]       = Field(None, min_length=3, max_length=500)
    quantity:              Optional[int]       = Field(None, gt=0)
    unit_price:            Optional[Decimal]   = Field(None, gt=0)
    total_amount:          Optional[Decimal]   = Field(None, gt=0)
    expected_delivery_date: Optional[datetime] = Field(None)

    @field_validator("status", mode="before")
    @classmethod
    def coerce_status(cls, v):
        """Accept both the string value and the enum member."""
        if v is None:
            return v
        try:
            return POStatus(v)
        except ValueError:
            allowed = ", ".join(s.value for s in POStatus)
            raise ValueError(f"status must be one of: {allowed}")


class POResponse(BaseModel):
    """Full PO response — returned by all read endpoints."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id:                    int
    po_number:             str
    vendor_id:             int
    vendor:                VendorInPO
    item_description:      str
    quantity:              int
    unit_price:            Decimal
    total_amount:          Decimal
    status:                POStatus
    order_date:            datetime
    expected_delivery_date: Optional[datetime] = None
    created_at:            datetime
    updated_at:            Optional[datetime]  = None


class POFilterParams(BaseModel):
    """
    Validated query-parameter bundle for GET /purchase-orders.

    All fields optional and combinable:
      - status     : one of the 5 POStatus values
      - start_date : lower bound on order_date  (YYYY-MM-DD, inclusive)
      - end_date   : upper bound on order_date  (YYYY-MM-DD, inclusive)
      - vendor_id  : restrict to a single vendor
    """

    status:     Optional[POStatus] = Field(None)
    start_date: Optional[date]     = Field(None)
    end_date:   Optional[date]     = Field(None)
    vendor_id:  Optional[int]      = Field(None, gt=0)

    @field_validator("status", mode="before")
    @classmethod
    def coerce_status(cls, v):
        if v is None:
            return v
        try:
            return POStatus(v)
        except ValueError:
            allowed = ", ".join(s.value for s in POStatus)
            raise ValueError(f"status must be one of: {allowed}")

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v: Optional[date], info) -> Optional[date]:
        start = info.data.get("start_date")
        if v is not None and start is not None and v < start:
            raise ValueError("end_date must be on or after start_date")
        return v


class POSummary(BaseModel):
    """Response for GET /purchase-orders/summary — dashboard chart data."""

    total:     int
    pending:   int
    approved:  int
    shipped:   int
    delivered: int
    cancelled: int


# ── Legacy aliases kept so po_dashboard_router.py imports don't break ─────────
# These are thin wrappers; the dashboard router is being replaced in this sprint.
VendorBrief = VendorInPO
