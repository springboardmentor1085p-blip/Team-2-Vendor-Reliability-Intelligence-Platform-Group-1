from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class VendorPerformanceBase(BaseModel):
    vendor_id: int
    on_time_deliveries: int = 0
    delayed_deliveries: int = 0

    quality_rating: float = 0.0
    response_time: float = 0.0
    issue_resolution_time: float = 0.0
    order_completion_rate: float = 0.0
    service_rating: float = 0.0

    performance_score: float = 0.0


class VendorPerformanceCreate(VendorPerformanceBase):
    pass


class VendorPerformanceUpdate(BaseModel):
    on_time_deliveries: Optional[int] = None
    delayed_deliveries: Optional[int] = None

    quality_rating: Optional[float] = None
    response_time: Optional[float] = None
    issue_resolution_time: Optional[float] = None
    order_completion_rate: Optional[float] = None
    service_rating: Optional[float] = None

    performance_score: Optional[float] = None


class VendorPerformanceResponse(VendorPerformanceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)