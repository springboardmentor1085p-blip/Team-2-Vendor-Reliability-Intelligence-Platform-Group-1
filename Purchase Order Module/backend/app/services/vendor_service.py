from datetime import datetime
from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.vendor import Vendor, VendorStatus
from app.schemas.vendor import VendorCreate, VendorUpdate


def _generate_vendor_code(db: Session) -> str:
    """Generate vendor code in format VND-XXXXXX."""
    count = db.query(Vendor).count()
    return f"VND-{(count + 1):06d}"


def create_vendor(db: Session, vendor_data: VendorCreate) -> Vendor:
    existing = db.query(Vendor).filter(Vendor.email == vendor_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vendor with email '{vendor_data.email}' already exists",
        )
    vendor_code = _generate_vendor_code(db)
    vendor = Vendor(vendor_code=vendor_code, **vendor_data.model_dump())
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


def get_vendor(db: Session, vendor_id: int) -> Vendor:
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


def list_vendors(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status_filter: Optional[VendorStatus] = None,
    search: Optional[str] = None,
) -> Tuple[List[Vendor], int]:
    query = db.query(Vendor)
    if status_filter:
        query = query.filter(Vendor.status == status_filter)
    if search:
        like = f"%{search}%"
        query = query.filter(
            Vendor.company_name.ilike(like) | Vendor.vendor_code.ilike(like)
        )
    total = query.count()
    vendors = query.order_by(Vendor.created_at.desc()).offset(skip).limit(limit).all()
    return vendors, total


def update_vendor(db: Session, vendor_id: int, update_data: VendorUpdate) -> Vendor:
    vendor = get_vendor(db, vendor_id)
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(vendor, field, value)
    db.commit()
    db.refresh(vendor)
    return vendor


def approve_vendor(db: Session, vendor_id: int) -> Vendor:
    vendor = get_vendor(db, vendor_id)
    vendor.status = VendorStatus.APPROVED
    db.commit()
    db.refresh(vendor)
    return vendor
