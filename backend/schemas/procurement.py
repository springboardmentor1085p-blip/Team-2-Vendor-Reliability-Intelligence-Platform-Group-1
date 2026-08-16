from pydantic import BaseModel
from datetime import date


class ProcurementCreate(BaseModel):

    request_id: str
    purchase_order: str
    item_name: str
    quantity: int
    vendor: str
    delivery_date: date
    status: str = "Pending"
    invoice: str = ""


class ProcurementResponse(BaseModel):

    id: int
    request_id: str
    purchase_order: str
    item_name: str
    quantity: int
    vendor: str
    delivery_date: date
    status: str
    invoice: str | None

    class Config:
        from_attributes = True