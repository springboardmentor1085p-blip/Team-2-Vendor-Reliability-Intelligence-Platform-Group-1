from sqlalchemy import Column, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Contract(BaseModel):
    __tablename__ = "contracts"

    contract_number = Column(String(50), unique=True, nullable=False)

    vendor_id = Column(ForeignKey("vendors.id"), nullable=False)

    contract_title = Column(String(255), nullable=False)

    start_date = Column(Date, nullable=False)

    end_date = Column(Date, nullable=False)

    contract_value = Column(Float, default=0.0)

    status = Column(String(50), default="Active")

    terms_conditions = Column(String(1000))

    vendor = relationship("Vendor")