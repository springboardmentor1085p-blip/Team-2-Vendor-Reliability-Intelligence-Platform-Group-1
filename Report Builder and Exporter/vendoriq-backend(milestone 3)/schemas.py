from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic import ConfigDict
from datetime import datetime, date
from decimal import Decimal
from typing import Optional
import re

# ── Import enums ──────────────────────────────────────────────────────────────
from models import POStatus, NotificationChannelEnum, NotificationStatusEnum, ExportTypeEnum, ExportStatusEnum


# ── Vendor schemas (Milestone 1) ──────────────────────────────────────────────

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
    """All fields optional — only the fields you send will be updated."""

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
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    vendorName: str = Field(validation_alias="name")
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None


# ── Purchase Order schemas (Milestone 2) ──────────────────────────────────────

class VendorInPO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vendor_name: str = Field(validation_alias="name")
    email: str
    status: str


class POCreate(BaseModel):
    vendor_id:              int              = Field(..., gt=0)
    po_number:              str              = Field(..., min_length=1, max_length=50)
    item_description:       str              = Field(..., min_length=3, max_length=500)
    quantity:               int              = Field(..., gt=0)
    unit_price:             Decimal          = Field(..., gt=0)
    total_amount:           Decimal          = Field(..., gt=0)
    order_date:             Optional[datetime] = Field(None)
    expected_delivery_date: Optional[datetime] = Field(None)

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
    status:                 Optional[POStatus] = Field(None)
    item_description:       Optional[str]      = Field(None, min_length=3, max_length=500)
    quantity:               Optional[int]      = Field(None, gt=0)
    unit_price:             Optional[Decimal]  = Field(None, gt=0)
    total_amount:           Optional[Decimal]  = Field(None, gt=0)
    expected_delivery_date: Optional[datetime] = Field(None)

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


class POResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id:                     int
    po_number:              str
    vendor_id:              int
    vendor:                 VendorInPO
    item_description:       str
    quantity:               int
    unit_price:             Decimal
    total_amount:           Decimal
    status:                 POStatus
    order_date:             datetime
    expected_delivery_date: Optional[datetime] = None
    created_at:             datetime
    updated_at:             Optional[datetime] = None


class POFilterParams(BaseModel):
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
    total:     int
    pending:   int
    approved:  int
    shipped:   int
    delivered: int
    cancelled: int


VendorBrief = VendorInPO


# ── NEW in Milestone 3 — Notification Preference schemas ─────────────────────

class NotificationPreferenceCreate(BaseModel):
    """
    Request body for POST /notifications/preferences.
    Both channel flags default to True if omitted.
    """

    user_id:        int  = Field(..., gt=0, description="ID of the user these preferences belong to")
    email_enabled:  bool = Field(True,  description="Whether email notifications are enabled")
    in_app_enabled: bool = Field(True,  description="Whether in-app notifications are enabled")


class NotificationPreferenceUpdate(BaseModel):
    """
    Request body for PUT /notifications/preferences/{user_id}.
    All fields optional — only supplied fields are updated.
    """

    email_enabled:  Optional[bool] = Field(None, description="Toggle email notifications on/off")
    in_app_enabled: Optional[bool] = Field(None, description="Toggle in-app notifications on/off")


class NotificationPreferenceResponse(BaseModel):
    """Full preference record returned by all preference endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id:             int
    user_id:        int
    email_enabled:  bool
    in_app_enabled: bool
    created_at:     datetime
    updated_at:     Optional[datetime] = None


# ── NEW in Milestone 3 — Notification Queue schemas ───────────────────────────

class NotificationQueueCreate(BaseModel):
    """
    Request body for POST /notifications/queue.
    Enqueues a new notification for a user on a specific channel.
    """

    user_id: int                       = Field(..., gt=0, description="Recipient user ID")
    message: str                       = Field(..., min_length=1, max_length=2000, description="Notification message body")
    channel: NotificationChannelEnum   = Field(..., description="Delivery channel: email | in_app")

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("message must not be blank or whitespace only")
        return v.strip()

    @field_validator("channel", mode="before")
    @classmethod
    def coerce_channel(cls, v):
        if v is None:
            raise ValueError("channel is required")
        try:
            return NotificationChannelEnum(v)
        except ValueError:
            allowed = ", ".join(c.value for c in NotificationChannelEnum)
            raise ValueError(f"channel must be one of: {allowed}")


class NotificationQueueUpdate(BaseModel):
    """
    Request body for PATCH /notifications/queue/{id}.
    Typically used to mark a notification as sent or failed.
    """

    status:  Optional[NotificationStatusEnum] = Field(None, description="New delivery status: pending | sent | failed")
    sent_at: Optional[datetime]               = Field(None, description="Timestamp when the notification was sent")

    @field_validator("status", mode="before")
    @classmethod
    def coerce_status(cls, v):
        if v is None:
            return v
        try:
            return NotificationStatusEnum(v)
        except ValueError:
            allowed = ", ".join(s.value for s in NotificationStatusEnum)
            raise ValueError(f"status must be one of: {allowed}")


class NotificationQueueResponse(BaseModel):
    """Full queue entry returned by notification queue endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id:         int
    user_id:    int
    message:    str
    status:     NotificationStatusEnum
    channel:    NotificationChannelEnum
    created_at: datetime
    sent_at:    Optional[datetime] = None


class NotificationQueueStatusUpdate(BaseModel):
    """
    Request body for PUT /notifications/queue/{id}/status.
    Updates only the delivery status of a queue entry.
    When status is set to 'sent', sent_at defaults to the current time
    if not explicitly provided.
    """

    status:  NotificationStatusEnum = Field(..., description="New delivery status: pending | sent | failed")
    sent_at: Optional[datetime]     = Field(None, description="Override the sent timestamp (defaults to now when status='sent')")

    @field_validator("status", mode="before")
    @classmethod
    def coerce_status(cls, v):
        if v is None:
            raise ValueError("status is required")
        try:
            return NotificationStatusEnum(v)
        except ValueError:
            allowed = ", ".join(s.value for s in NotificationStatusEnum)
            raise ValueError(f"status must be one of: {allowed}")


# ── NEW in Milestone 3 — Export Job schemas ───────────────────────────────────

class ExportJobCreate(BaseModel):
    """
    Request body for POST /exports.
    The caller specifies what to export; status starts as 'pending' automatically.
    """

    user_id:     int            = Field(..., gt=0, description="ID of the user requesting the export")
    export_type: ExportTypeEnum = Field(..., description="What to export: vendors | purchase_orders | analytics")

    @field_validator("export_type", mode="before")
    @classmethod
    def coerce_export_type(cls, v):
        if v is None:
            raise ValueError("export_type is required")
        try:
            return ExportTypeEnum(v)
        except ValueError:
            allowed = ", ".join(t.value for t in ExportTypeEnum)
            raise ValueError(f"export_type must be one of: {allowed}")


class ExportJobUpdate(BaseModel):
    """
    Request body for PATCH /exports/{id}.
    Used internally by the worker to advance status and record the output path or error.
    All fields optional — only supplied fields are updated.
    """

    status:        Optional[ExportStatusEnum] = Field(None, description="New job status: pending | processing | completed | failed")
    file_path:     Optional[str]              = Field(None, max_length=500, description="Absolute or relative path to the generated file")
    completed_at:  Optional[datetime]         = Field(None, description="Timestamp when the job finished (set automatically on completion)")
    error_message: Optional[str]              = Field(None, description="Error details when status is 'failed'")

    @field_validator("status", mode="before")
    @classmethod
    def coerce_status(cls, v):
        if v is None:
            return v
        try:
            return ExportStatusEnum(v)
        except ValueError:
            allowed = ", ".join(s.value for s in ExportStatusEnum)
            raise ValueError(f"status must be one of: {allowed}")


class ExportJobResponse(BaseModel):
    """Full export job record returned by all export endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id:            int
    user_id:       int
    export_type:   ExportTypeEnum
    status:        ExportStatusEnum
    file_path:     Optional[str]      = None
    requested_at:  datetime
    completed_at:  Optional[datetime] = None
    error_message: Optional[str]      = None
