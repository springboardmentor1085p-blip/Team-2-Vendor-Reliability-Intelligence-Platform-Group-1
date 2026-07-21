from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.purchase_order import (
    get_purchase_order_by_id,
    get_purchase_order_by_number,
    get_all_purchase_orders,
    create_purchase_order,
    update_purchase_order,
    delete_purchase_order,
)

from app.crud.vendor import get_vendor_by_id
from app.crud.procurement import get_procurement_by_id

from app.models.purchase_order import PurchaseOrder
from app.schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderUpdate,
)


def create_purchase_order_service(
    db: Session,
    purchase_order: PurchaseOrderCreate,
):
    existing = get_purchase_order_by_number(
        db,
        purchase_order.po_number,
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase Order already exists",
        )

    vendor = get_vendor_by_id(db, purchase_order.vendor_id)

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found",
        )

    procurement = get_procurement_by_id(
        db,
        purchase_order.procurement_id,
    )

    if not procurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procurement not found",
        )

    new_po = PurchaseOrder(**purchase_order.model_dump())

    return create_purchase_order(db, new_po)


def get_all_purchase_orders_service(db: Session):
    return get_all_purchase_orders(db)


def get_purchase_order_by_id_service(
    db: Session,
    po_id: int,
):
    po = get_purchase_order_by_id(db, po_id)

    if not po:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found",
        )

    return po


def update_purchase_order_service(
    db: Session,
    po_id: int,
    po_data: PurchaseOrderUpdate,
):
    po = get_purchase_order_by_id(db, po_id)

    if not po:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found",
        )

    update_data = po_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(po, key, value)

    return update_purchase_order(db, po)


def delete_purchase_order_service(
    db: Session,
    po_id: int,
):
    po = get_purchase_order_by_id(db, po_id)

    if not po:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found",
        )

    delete_purchase_order(db, po)

    return {
        "message": "Purchase Order deleted successfully"
    }