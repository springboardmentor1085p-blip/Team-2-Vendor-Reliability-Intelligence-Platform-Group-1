from sqlalchemy import Column, String, Date, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class PurchaseOrder(BaseModel):
    __tablename__ = "purchase_orders"

    po_number = Column(String(50), unique=True, nullable=False)
    procurement_id = Column(ForeignKey("procurements.id"), nullable=False)
    vendor_id = Column(ForeignKey("vendors.id"), nullable=False)

    order_date = Column(Date, nullable=False)
    expected_delivery = Column(Date)

    total_amount = Column(Float, default=0.0)

    status = Column(
        String(50),
        default="Ordered"
    )

    payment_status = Column(
        String(50),
        default="Pending"
    )

    remarks = Column(String(500))

    procurement = relationship("Procurement")
    vendor = relationship("Vendor")