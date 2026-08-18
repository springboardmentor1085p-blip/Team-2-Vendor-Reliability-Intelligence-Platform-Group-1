from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RiskBase(BaseModel):
    vendor_id: int
    risk_type: str
    severity: str
    description: Optional[str] = None
    impact_score: int
    status: Optional[str] = "Open"


class RiskCreate(RiskBase):
    pass


class RiskUpdate(BaseModel):
    risk_type: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    impact_score: Optional[int] = None
    status: Optional[str] = None


class RiskResponse(RiskBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
