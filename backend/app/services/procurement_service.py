from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.procurement import (
    get_procurement_by_id,
    get_procurement_by_request_number,
    get_all_procurements,
    create_procurement,
    update_procurement,
    delete_procurement,
)
from app.crud.vendor import get_vendor_by_id
from app.models.procurement import Procurement
from app.schemas.procurement import ProcurementCreate, ProcurementUpdate


def create_procurement_service(db: Session, procurement: ProcurementCreate):
    existing = get_procurement_by_request_number(
        db,
        procurement.request_number,
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request number already exists",
        )

    vendor = get_vendor_by_id(db, procurement.vendor_id)

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found",
        )

    new_procurement = Procurement(**procurement.model_dump())

    return create_procurement(db, new_procurement)


def get_all_procurements_service(db: Session):
    return get_all_procurements(db)


def get_procurement_by_id_service(
    db: Session,
    procurement_id: int,
):
    procurement = get_procurement_by_id(db, procurement_id)

    if not procurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procurement not found",
        )

    return procurement


def update_procurement_service(
    db: Session,
    procurement_id: int,
    procurement_data: ProcurementUpdate,
):
    procurement = get_procurement_by_id(db, procurement_id)

    if not procurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procurement not found",
        )

    update_data = procurement_data.model_dump(exclude_unset=True)

    if "vendor_id" in update_data:
        vendor = get_vendor_by_id(db, update_data["vendor_id"])

        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor not found",
            )

    for key, value in update_data.items():
        setattr(procurement, key, value)

    return update_procurement(db, procurement)


def delete_procurement_service(
    db: Session,
    procurement_id: int,
):
    procurement = get_procurement_by_id(db, procurement_id)

    if not procurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procurement not found",
        )

    delete_procurement(db, procurement)

    return {
        "message": "Procurement deleted successfully"
    }