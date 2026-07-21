from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.communication import (
    get_communication_by_id,
    get_all_communications,
    create_communication,
    update_communication,
    delete_communication,
)

from app.crud.vendor import get_vendor_by_id

from app.models.communication import Communication

from app.schemas.communication import (
    CommunicationCreate,
    CommunicationUpdate,
)


def create_communication_service(
    db: Session,
    communication: CommunicationCreate,
):
    vendor = get_vendor_by_id(db, communication.vendor_id)

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found",
        )

    new_communication = Communication(**communication.model_dump())

    return create_communication(db, new_communication)


def get_all_communications_service(db: Session):
    return get_all_communications(db)


def get_communication_by_id_service(
    db: Session,
    communication_id: int,
):
    communication = get_communication_by_id(db, communication_id)

    if not communication:
        raise HTTPException(
            status_code=404,
            detail="Communication not found",
        )

    return communication


def update_communication_service(
    db: Session,
    communication_id: int,
    communication_data: CommunicationUpdate,
):
    communication = get_communication_by_id(db, communication_id)

    if not communication:
        raise HTTPException(
            status_code=404,
            detail="Communication not found",
        )

    update_data = communication_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(communication, key, value)

    return update_communication(db, communication)


def delete_communication_service(
    db: Session,
    communication_id: int,
):
    communication = get_communication_by_id(db, communication_id)

    if not communication:
        raise HTTPException(
            status_code=404,
            detail="Communication not found",
        )

    delete_communication(db, communication)

    return {
        "message": "Communication deleted successfully"
    }