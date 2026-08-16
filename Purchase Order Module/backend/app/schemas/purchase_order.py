from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, field_validator
from app.models.purchase_order import POPriority, POStatus


class POItemCreate(BaseModel):
    item_code:   Optional[str] = None
    item_name:   str
    description: Optional[str] = None
    quantity:    Decimal
    unit:        str = "pcs"
    unit_price:  Decimal
    notes:       Optional[str] = None

    @field_validator("quantity")
    @classmethod
    def qty_ok(cls, v):
        if v <= 0: raise ValueError("Quantity must be > 0")
        return v

    @field_validator("unit_price")
    @classmethod
    def price_ok(cls, v):
        if v < 0: raise ValueError("Unit price cannot be negative")
        return v


class POItemOut(BaseModel):
    id: int; item_code: Optional[str]; item_name: str
    description: Optional[str]; quantity: Decimal; unit: str
    unit_price: Decimal; total_price: Decimal; notes: Optional[str]
    class Config: from_attributes = True


class PurchaseOrderCreate(BaseModel):
    vendor_id:              int
    title:                  str
    description:            Optional[str]   = None
    priority:               POPriority      = POPriority.MEDIUM
    tax_rate:               Decimal         = Decimal("0")
    discount_amount:        Decimal         = Decimal("0")
    currency:               str             = "USD"
    required_date:          Optional[datetime] = None
    expected_delivery_date: Optional[datetime] = None
    delivery_address:       Optional[str]   = None
    shipping_method:        Optional[str]   = None
    internal_notes:         Optional[str]   = None
    vendor_notes:           Optional[str]   = None
    items:                  List[POItemCreate]

    @field_validator("items")
    @classmethod
    def items_ok(cls, v):
        if not v: raise ValueError("At least one item required")
        return v


class PurchaseOrderUpdate(BaseModel):
    title:                  Optional[str]               = None
    description:            Optional[str]               = None
    priority:               Optional[POPriority]        = None
    tax_rate:               Optional[Decimal]           = None
    discount_amount:        Optional[Decimal]           = None
    currency:               Optional[str]               = None
    required_date:          Optional[datetime]          = None
    expected_delivery_date: Optional[datetime]          = None
    delivery_address:       Optional[str]               = None
    shipping_method:        Optional[str]               = None
    tracking_number:        Optional[str]               = None
    internal_notes:         Optional[str]               = None
    vendor_notes:           Optional[str]               = None
    items:                  Optional[List[POItemCreate]] = None


class POStatusUpdate(BaseModel):
    status:              POStatus
    remarks:             Optional[str]      = None
    tracking_number:     Optional[str]      = None
    actual_delivery_date: Optional[datetime] = None


class POStatusHistoryOut(BaseModel):
    id: int; previous_status: Optional[POStatus]; new_status: POStatus
    remarks: Optional[str]; changed_at: datetime; changed_by: Optional[int]
    class Config: from_attributes = True


class VendorBrief(BaseModel):
    id: int; vendor_code: str; company_name: str
    class Config: from_attributes = True


class UserBrief(BaseModel):
    id: int; full_name: str; email: str
    class Config: from_attributes = True


class PurchaseOrderOut(BaseModel):
    id: int; po_number: str; vendor_id: int; vendor: VendorBrief
    created_by: int; created_by_user: UserBrief
    approved_by: Optional[int]; approved_by_user: Optional[UserBrief]
    title: str; description: Optional[str]; priority: POPriority; status: POStatus
    subtotal: Decimal; tax_rate: Decimal; tax_amount: Decimal
    discount_amount: Decimal; total_amount: Decimal; currency: str
    required_date: Optional[datetime]; expected_delivery_date: Optional[datetime]
    actual_delivery_date: Optional[datetime]; approved_at: Optional[datetime]
    dispatched_at: Optional[datetime]; delivered_at: Optional[datetime]
    delivery_address: Optional[str]; shipping_method: Optional[str]
    tracking_number: Optional[str]; internal_notes: Optional[str]; vendor_notes: Optional[str]
    created_at: datetime; updated_at: Optional[datetime]
    items: List[POItemOut]; status_history: List[POStatusHistoryOut]
    class Config: from_attributes = True


class PurchaseOrderListOut(BaseModel):
    id: int; po_number: str; vendor: VendorBrief; title: str
    priority: POPriority; status: POStatus; total_amount: Decimal
    currency: str; required_date: Optional[datetime]
    expected_delivery_date: Optional[datetime]; created_at: datetime
    class Config: from_attributes = True


class POSummaryStats(BaseModel):
    total_orders: int; pending: int; approved: int; dispatched: int
    delivered: int; completed: int; cancelled: int
    total_value: Decimal; this_month_orders: int; this_month_value: Decimal
