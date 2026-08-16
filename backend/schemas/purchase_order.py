from pydantic import BaseModel
from datetime import date


class PurchaseOrderCreate(BaseModel):

    po_number: str
    vendor: str
    item_name: str
    quantity: int
    order_date: date
    expected_delivery: date
    status: str = "Pending"


class PurchaseOrderResponse(BaseModel):

    id: int
    po_number: str
    vendor: str
    item_name: str
    quantity: int
    order_date: date
    expected_delivery: date
    status: str

    class Config:
        from_attributes = True