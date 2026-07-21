from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.crud.vendor import get_vendor_by_id


def get_pending_vendors_service(db: Session):
    return db.query(Vendor).filter(Vendor.status == "Pending").all()


def approve_vendor_service(db: Session, vendor_id: int):
    vendor = get_vendor_by_id(db, vendor_id)

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found",
        )

    vendor.status = "Active"

    db.commit()
    db.refresh(vendor)

    return {
        "message": "Vendor approved successfully",
        "vendor_id": vendor.id,
        "status": vendor.status,
    }


def reject_vendor_service(db: Session, vendor_id: int):
    vendor = get_vendor_by_id(db, vendor_id)

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found",
        )

    vendor.status = "Rejected"

    db.commit()
    db.refresh(vendor)

    return {
        "message": "Vendor rejected successfully",
        "vendor_id": vendor.id,
        "status": vendor.status,
    }