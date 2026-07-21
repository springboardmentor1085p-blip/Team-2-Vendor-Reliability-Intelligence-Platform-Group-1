from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.procurement import (
    ProcurementCreate,
    ProcurementUpdate,
    ProcurementResponse,
)
from app.services.procurement_service import (
    create_procurement_service,
    get_all_procurements_service,
    get_procurement_by_id_service,
    update_procurement_service,
    delete_procurement_service,
)

router = APIRouter(
    prefix="/procurements",
    tags=["Procurement"],
)


@router.post(
    "",
    response_model=ProcurementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_procurement(
    procurement: ProcurementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_procurement_service(db, procurement)


@router.get(
    "",
    response_model=list[ProcurementResponse],
)
def get_all_procurements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_procurements_service(db)


@router.get(
    "/{procurement_id}",
    response_model=ProcurementResponse,
)
def get_procurement_by_id(
    procurement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_procurement_by_id_service(db, procurement_id)


@router.put(
    "/{procurement_id}",
    response_model=ProcurementResponse,
)
def update_procurement(
    procurement_id: int,
    procurement: ProcurementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_procurement_service(
        db,
        procurement_id,
        procurement,
    )


@router.delete(
    "/{procurement_id}",
)
def delete_procurement(
    procurement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_procurement_service(db, procurement_id)