from pydantic import BaseModel, Field
from typing import List


class ReliabilityResponse(BaseModel):
    vendor_id: int
    delivery_score: float = Field(ge=0, le=100)
    quality_score: float = Field(ge=0, le=100)
    compliance_score: float = Field(ge=0, le=100)
    communication_score: float = Field(ge=0, le=100)
    risk_score: float = Field(ge=0, le=100)
    overall_reliability_score: float = Field(ge=0, le=100)
    risk_level: str
    recommendations: List[str] = []
