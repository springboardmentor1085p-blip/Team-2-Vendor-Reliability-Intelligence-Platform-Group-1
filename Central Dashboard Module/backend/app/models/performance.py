from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Text, Boolean, Date
from sqlalchemy.orm import relationship
from app.database import Base


class VendorPerformance(Base):
    __tablename__ = "vendor_performance"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    period_month = Column(Integer, nullable=False)   # 1-12
    period_year = Column(Integer, nullable=False)
    on_time_deliveries = Column(Integer, default=0)
    delayed_deliveries = Column(Integer, default=0)
    total_orders = Column(Integer, default=0)
    quality_rating = Column(Float, default=0.0)       # 0-5
    response_time_hours = Column(Float, default=0.0)
    issue_resolution_days = Column(Float, default=0.0)
    order_completion_rate = Column(Float, default=0.0) # 0-100
    communication_score = Column(Float, default=0.0)   # 0-5
    reliability_score = Column(Float, default=0.0)     # 0-100
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vendor = relationship("Vendor", back_populates="performance_records")


class DeliveryRecord(Base):
    __tablename__ = "delivery_records"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True)
    expected_date = Column(Date, nullable=False)
    actual_date = Column(Date, nullable=True)
    is_on_time = Column(Boolean, default=False)
    delay_days = Column(Integer, default=0)
    quality_score = Column(Float, default=0.0)   # 0-5
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    vendor = relationship("Vendor", back_populates="delivery_records")
