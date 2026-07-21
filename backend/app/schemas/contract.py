from datetime import date
from typing import Optional

from pydantic import BaseModel


class ContractCreate(BaseModel):
    contract_number: str
    vendor_id: int
    contract_title: str
    start_date: date
    end_date: date
    contract_value: float
    terms_conditions: Optional[str] = None


class ContractUpdate(BaseModel):
    contract_title: Optional[str] = None
    end_date: Optional[date] = None
    contract_value: Optional[float] = None
    status: Optional[str] = None
    terms_conditions: Optional[str] = None


class ContractResponse(BaseModel):
    id: int
    contract_number: str
    vendor_id: int
    contract_title: str
    start_date: date
    end_date: date
    contract_value: float
    status: str
    terms_conditions: Optional[str]

    class Config:
        from_attributes = True