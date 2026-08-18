from sqlalchemy import Column, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Contract(BaseModel):
    __tablename__ = "contracts"

    vendor_id = Column(
        ForeignKey("vendors.id"),
        nullable=False
    )

    contract_number = Column(
        String(100),
        unique=True,
        nullable=False
    )

    start_date = Column(
        Date,
        nullable=False
    )

    end_date = Column(
        Date,
        nullable=False
    )

    status = Column(
        String(50),
        default="Active"
    )

    contract_name = Column(
        String(150),
        nullable=False
    )

    contract_value = Column(
        Float,
        nullable=False
    )

    currency = Column(
        String(10),
        default="INR"
    )

    description = Column(String)

    vendor = relationship("Vendor")
