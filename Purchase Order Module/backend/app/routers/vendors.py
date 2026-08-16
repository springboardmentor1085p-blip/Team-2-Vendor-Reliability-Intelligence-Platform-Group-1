from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.vendor import VendorStatus
from app.routers.deps import get_current_user
from app.schemas.vendor import VendorCreate, VendorOut, VendorUpdate
from app.services.vendor_service import (
    approve_vendor,
    create_vendor,
    get_vendor,
    list_vendors,
    update_vendor,
)

router = APIRouter(prefix="/api/vendors", tags=["Vendors"])


@router.post("/", response_model=VendorOut, status_code=status.HTTP_201_CREATED)
def create(
    vendor_data: VendorCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return create_vendor(db, vendor_data)


@router.get("/", response_model=dict)
def list_all(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=500),
    status_filter: Optional[VendorStatus] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    vendors, total = list_vendors(db, skip, limit, status_filter, search)
    return {
        "items": [VendorOut.model_validate(v) for v in vendors],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{vendor_id}", response_model=VendorOut)
def get_one(
    vendor_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return get_vendor(db, vendor_id)


@router.put("/{vendor_id}", response_model=VendorOut)
def update(
    vendor_id: int,
    update_data: VendorUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return update_vendor(db, vendor_id, update_data)


@router.post("/{vendor_id}/approve", response_model=VendorOut)
def approve(
    vendor_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return approve_vendor(db, vendor_id)
