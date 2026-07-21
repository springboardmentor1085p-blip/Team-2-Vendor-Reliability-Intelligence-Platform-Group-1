from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User

from app.schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderUpdate,
    PurchaseOrderResponse,
)

from app.services.purchase_order_service import (
    create_purchase_order_service,
    get_all_purchase_orders_service,
    get_purchase_order_by_id_service,
    update_purchase_order_service,
    delete_purchase_order_service,
)

router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase Orders"],
)


@router.post(
    "",
    response_model=PurchaseOrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_purchase_order(
    purchase_order: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_purchase_order_service(
        db,
        purchase_order,
    )


@router.get(
    "",
    response_model=list[PurchaseOrderResponse],
)
def get_all_purchase_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_purchase_orders_service(db)


@router.get(
    "/{po_id}",
    response_model=PurchaseOrderResponse,
)
def get_purchase_order_by_id(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_purchase_order_by_id_service(db, po_id)


@router.put(
    "/{po_id}",
    response_model=PurchaseOrderResponse,
)
def update_purchase_order(
    po_id: int,
    purchase_order: PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_purchase_order_service(
        db,
        po_id,
        purchase_order,
    )


@router.delete("/{po_id}")
def delete_purchase_order(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_purchase_order_service(db, po_id)