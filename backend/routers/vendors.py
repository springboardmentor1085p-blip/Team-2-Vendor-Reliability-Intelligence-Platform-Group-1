from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.vendor import Vendor
from schemas.vendor_schema import VendorCreate, VendorResponse

router = APIRouter(
    prefix="/vendors",
    tags=["Vendors"]
)

@router.post("/", response_model=VendorResponse)
def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    new_vendor = Vendor(**vendor.model_dump())
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor


@router.get("/{vendor_id}/profile")
def get_vendor_profile(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    return {
        "vendor_id": vendor.id,
        "company_name": vendor.company_name,
        "email": vendor.email,
        "phone": vendor.phone,
        "address": vendor.address,
        "status": vendor.status
    }
@router.put("/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: int,
    vendor_data: VendorCreate,
    db: Session = Depends(get_db)
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.company_name = vendor_data.company_name
    vendor.email = vendor_data.email
    vendor.phone = vendor_data.phone
    vendor.address = vendor_data.address
    vendor.status = vendor_data.status

    db.commit()
    db.refresh(vendor)

    return vendor