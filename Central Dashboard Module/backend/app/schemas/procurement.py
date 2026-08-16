from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.models.procurement import ProcurementStatus


class ProcurementRequestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    estimated_cost: float = 0.0


class PurchaseOrderCreate(BaseModel):
    vendor_id: int
    procurement_request_id: Optional[int] = None
    description: Optional[str] = None
    total_amount: float = 0.0
    order_date: Optional[date] = None
    expected_delivery: Optional[date] = None


class PurchaseOrderUpdate(BaseModel):
    status: Optional[ProcurementStatus] = None
    actual_delivery: Optional[date] = None
    total_amount: Optional[float] = None


class PurchaseOrderOut(BaseModel):
    id: int
    po_number: str
    vendor_id: int
    status: ProcurementStatus
    total_amount: float
    order_date: Optional[date]
    expected_delivery: Optional[date]
    actual_delivery: Optional[date]
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
