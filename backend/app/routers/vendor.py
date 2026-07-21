from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from app.schemas.vendor import (
    VendorCreate,
    VendorUpdate,
    VendorResponse,
    VendorApprovalResponse,
)

from app.services.vendor_service import (
    create_vendor_service,
    get_all_vendors_service,
    get_vendor_by_id_service,
    update_vendor_service,
    delete_vendor_service,
)

from app.services.vendor_approval_service import (
    get_pending_vendors_service,
    approve_vendor_service,
    reject_vendor_service,
)

router = APIRouter(
    prefix="/vendors",
    tags=["Vendors"],
)


# ----------------------------
# Vendor CRUD APIs
# ----------------------------

@router.post(
    "",
    response_model=VendorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_vendor(
    vendor: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_vendor_service(db, vendor)


@router.get(
    "",
    response_model=list[VendorResponse],
)
def get_all_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_vendors_service(db)


@router.get(
    "/{vendor_id}",
    response_model=VendorResponse,
)
def get_vendor_by_id(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_vendor_by_id_service(db, vendor_id)


@router.put(
    "/{vendor_id}",
    response_model=VendorResponse,
)
def update_vendor(
    vendor_id: int,
    vendor: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_vendor_service(db, vendor_id, vendor)


@router.delete(
    "/{vendor_id}",
)
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_vendor_service(db, vendor_id)


# ----------------------------
# Vendor Approval Workflow APIs
# ----------------------------

@router.get(
    "/pending",
    response_model=list[VendorResponse],
)
def get_pending_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_pending_vendors_service(db)


@router.put(
    "/{vendor_id}/approve",
    response_model=VendorApprovalResponse,
)
def approve_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return approve_vendor_service(db, vendor_id)


@router.put(
    "/{vendor_id}/reject",
    response_model=VendorApprovalResponse,
)
def reject_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return reject_vendor_service(db, vendor_id)