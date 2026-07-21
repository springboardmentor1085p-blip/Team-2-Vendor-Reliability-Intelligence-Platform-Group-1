from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User

from app.schemas.communication import (
    CommunicationCreate,
    CommunicationUpdate,
    CommunicationResponse,
)

from app.services.communication_service import (
    create_communication_service,
    get_all_communications_service,
    get_communication_by_id_service,
    update_communication_service,
    delete_communication_service,
)

router = APIRouter(
    prefix="/communications",
    tags=["Communications"],
)


@router.post(
    "",
    response_model=CommunicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_communication(
    communication: CommunicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_communication_service(db, communication)


@router.get(
    "",
    response_model=list[CommunicationResponse],
)
def get_all_communications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_communications_service(db)


@router.get(
    "/{communication_id}",
    response_model=CommunicationResponse,
)
def get_communication_by_id(
    communication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_communication_by_id_service(
        db,
        communication_id,
    )


@router.put(
    "/{communication_id}",
    response_model=CommunicationResponse,
)
def update_communication(
    communication_id: int,
    communication: CommunicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_communication_service(
        db,
        communication_id,
        communication,
    )


@router.delete("/{communication_id}")
def delete_communication(
    communication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_communication_service(
        db,
        communication_id,
    )