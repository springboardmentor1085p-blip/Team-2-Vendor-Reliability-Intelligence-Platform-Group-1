from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    contract_name = Column(String, nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    status = Column(String, default="Pending")
    start_date = Column(Date)
    end_date = Column(Date)
    file_url = Column(String, nullable=True)

    vendor = relationship("Vendor", back_populates="contracts")