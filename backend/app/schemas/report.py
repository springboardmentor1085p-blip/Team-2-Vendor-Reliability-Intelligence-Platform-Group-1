from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ReportBase(BaseModel):
    report_name: str
    report_type: str
    generated_by: str
    file_format: str
    status: Optional[str] = "Generated"


class ReportCreate(ReportBase):
    pass


class ReportUpdate(BaseModel):
    report_name: Optional[str] = None
    report_type: Optional[str] = None
    generated_by: Optional[str] = None
    file_format: Optional[str] = None
    status: Optional[str] = None


class ReportResponse(ReportBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)