from sqlalchemy import Column, String, Date, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Procurement(BaseModel):
    __tablename__ = "procurements"

    request_number = Column(String(50), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(String(500))
    vendor_id = Column(ForeignKey("vendors.id"), nullable=False)

    requested_by = Column(String(150), nullable=False)
    approved_by = Column(String(150), nullable=True)

    request_date = Column(Date, nullable=False)
    expected_delivery = Column(Date)

    total_amount = Column(Float, default=0.0)

    status = Column(
        String(50),
        default="Pending"
    )

    invoice_number = Column(String(100))
    remarks = Column(String(500))

    vendor = relationship("Vendor")