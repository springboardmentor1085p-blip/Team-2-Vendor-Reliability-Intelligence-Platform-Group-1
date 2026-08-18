from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from app.schemas.vendor_performance import (
    VendorPerformanceCreate,
    VendorPerformanceUpdate,
    VendorPerformanceResponse,
)

from app.services.vendor_performance_service import (
    create_vendor_performance_service,
    get_all_vendor_performance_service,
    get_vendor_performance_by_id_service,
    get_vendor_performance_by_vendor_id_service,
    update_vendor_performance_service,
    delete_vendor_performance_service,
)

router = APIRouter(
    prefix="/vendor-performance",
    tags=["Vendor Performance"],
)


# ---------------------------------------
# Vendor Performance CRUD APIs
# ---------------------------------------

@router.post(
    "",
    response_model=VendorPerformanceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_vendor_performance(
    performance: VendorPerformanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_vendor_performance_service(
        db,
        performance,
    )


@router.get(
    "",
    response_model=list[VendorPerformanceResponse],
)
def get_all_vendor_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_vendor_performance_service(db)


@router.get(
    "/{performance_id}",
    response_model=VendorPerformanceResponse,
)
def get_vendor_performance_by_id(
    performance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_vendor_performance_by_id_service(
        db,
        performance_id,
    )


@router.get(
    "/vendor/{vendor_id}",
    response_model=VendorPerformanceResponse,
)
def get_vendor_performance_by_vendor_id(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_vendor_performance_by_vendor_id_service(
        db,
        vendor_id,
    )


@router.put(
    "/{performance_id}",
    response_model=VendorPerformanceResponse,
)
def update_vendor_performance(
    performance_id: int,
    performance: VendorPerformanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_vendor_performance_service(
        db,
        performance_id,
        performance,
    )


@router.delete(
    "/{performance_id}",
)
def delete_vendor_performance(
    performance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_vendor_performance_service(
        db,
        performance_id,
    )