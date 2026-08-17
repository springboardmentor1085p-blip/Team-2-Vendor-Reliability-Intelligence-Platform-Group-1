from pydantic import BaseModel
from datetime import date
from typing import Optional

class ContractCreate(BaseModel):
    contract_name: str
    vendor_id: int
    status: str = "Pending"
    start_date: date
    end_date: date
    file_url: Optional[str] = None

class ContractResponse(BaseModel):
    id: int
    contract_name: str
    vendor_id: int
    status: str
    start_date: date
    end_date: date
    file_url: Optional[str] = None

    class Config:
        from_attributes = True