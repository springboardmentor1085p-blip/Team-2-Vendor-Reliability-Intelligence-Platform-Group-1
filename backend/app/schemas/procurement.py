from datetime import date
from typing import Optional

from pydantic import BaseModel


class ProcurementCreate(BaseModel):
    request_number: str
    title: str
    description: Optional[str] = None
    vendor_id: int
    requested_by: str
    request_date: date
    expected_delivery: Optional[date] = None
    total_amount: float
    invoice_number: Optional[str] = None
    remarks: Optional[str] = None


class ProcurementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    vendor_id: Optional[int] = None
    approved_by: Optional[str] = None
    expected_delivery: Optional[date] = None
    total_amount: Optional[float] = None
    status: Optional[str] = None
    invoice_number: Optional[str] = None
    remarks: Optional[str] = None


class ProcurementResponse(BaseModel):
    id: int
    request_number: str
    title: str
    description: Optional[str]
    vendor_id: int
    requested_by: str
    approved_by: Optional[str]
    request_date: date
    expected_delivery: Optional[date]
    total_amount: float
    status: str
    invoice_number: Optional[str]
    remarks: Optional[str]

    class Config:
        from_attributes = True