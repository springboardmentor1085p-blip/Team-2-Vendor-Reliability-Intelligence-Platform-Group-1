from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class VendorPerformance(BaseModel):
    __tablename__ = "vendor_performance"

    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)

    on_time_deliveries = Column(Integer, default=0)
    delayed_deliveries = Column(Integer, default=0)

    quality_rating = Column(Float, default=0.0)
    response_time = Column(Float, default=0.0)
    issue_resolution_time = Column(Float, default=0.0)
    order_completion_rate = Column(Float, default=0.0)
    service_rating = Column(Float, default=0.0)

    performance_score = Column(Float, default=0.0)

    vendor = relationship("Vendor")