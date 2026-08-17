from pydantic import BaseModel, ConfigDict
from typing import Optional


class VendorCreate(BaseModel):
    company_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    status: str = "Active"


class VendorResponse(VendorCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)