from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from models.purchase_order import PurchaseOrder
from schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderResponse
)

router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase Orders"]
)


@router.post("/", response_model=PurchaseOrderResponse)
def create_purchase_order(
    purchase_order: PurchaseOrderCreate,
    db: Session = Depends(get_db)
):

    existing_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.po_number == purchase_order.po_number
    ).first()

    if existing_order:
        raise HTTPException(
            status_code=400,
            detail="Purchase Order Number already exists"
        )

    new_order = PurchaseOrder(
        po_number=purchase_order.po_number,
        vendor=purchase_order.vendor,
        item_name=purchase_order.item_name,
        quantity=purchase_order.quantity,
        order_date=purchase_order.order_date,
        expected_delivery=purchase_order.expected_delivery,
        status=purchase_order.status
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


@router.get("/", response_model=list[PurchaseOrderResponse])
def get_purchase_orders(
    db: Session = Depends(get_db)
):

    return db.query(PurchaseOrder).all()


@router.get("/{order_id}", response_model=PurchaseOrderResponse)
def get_purchase_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    return order


@router.put("/{order_id}/status", response_model=PurchaseOrderResponse)
def update_purchase_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    order.status = status

    db.commit()
    db.refresh(order)

    return order


@router.delete("/{order_id}")
def delete_purchase_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    db.delete(order)
    db.commit()

    return {
        "message": "Purchase Order deleted successfully"
    }