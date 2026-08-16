from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import PurchaseOrder, Notification
from app.schemas import PurchaseOrderCreate
from app.models import PurchaseOrderAudit

router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase Orders"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE PURCHASE ORDER
@router.post("/")
def create_purchase_order(
    data: PurchaseOrderCreate,
    db: Session = Depends(get_db)
):
    purchase_order = PurchaseOrder(
        vendor_name=data.vendor_name,
        target_date=data.target_date,
        status=data.status
    )

    db.add(purchase_order)
    db.commit()
    db.refresh(purchase_order)

    audit = PurchaseOrderAudit(
    purchase_order_id=purchase_order.id,
    action="CREATED",
    old_status=None,
    new_status=purchase_order.status,
    changed_by="Admin"
    )
    db.add(audit)
    db.commit()
    
    print("Created PO =", purchase_order.id)

    notification = Notification(
        user_id=1,
        purchase_order_id=purchase_order.id,
        title="Purchase Order Created",
        message=f"Purchase Order #{purchase_order.id} created successfully.",
        is_read=False
    )

    db.add(notification)
    db.commit()

    return purchase_order


# GET ALL PURCHASE ORDERS
@router.get("/")
def get_all_purchase_orders(db: Session = Depends(get_db)):
    return db.query(PurchaseOrder).all()


# GET PURCHASE ORDER BY ID
@router.get("/{po_id}")
def get_purchase_order(po_id: int, db: Session = Depends(get_db)):

    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == po_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    return purchase_order


# UPDATE STATUS
@router.put("/{po_id}")
def update_status(
    po_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == po_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    # save old status
    old_status = purchase_order.status

    # update status
    purchase_order.status = status

    # audit log
    audit = PurchaseOrderAudit(
        purchase_order_id=purchase_order.id,
        action="STATUS_CHANGED",
        old_status=old_status,
        new_status=status,
        changed_by="Admin"
    )

    db.add(audit)

    # notification
    notification = Notification(
        user_id=1,
        purchase_order_id=purchase_order.id,
        title="Purchase Order Updated",
        message=f"Purchase Order #{purchase_order.id} status changed to {status}.",
        is_read=False
    )

    db.add(notification)

    db.commit()
    db.refresh(purchase_order)

    return purchase_order


@router.get("/{po_id}/timeline")
def get_timeline(po_id: int, db: Session = Depends(get_db)):

    timeline = db.query(PurchaseOrderAudit).filter(
        PurchaseOrderAudit.purchase_order_id == po_id
    ).order_by(PurchaseOrderAudit.changed_at.desc()).all()

    return timeline


@router.get("/analytics/status-counts")
def status_counts(db: Session = Depends(get_db)):

    orders = db.query(PurchaseOrder).all()

    result = {}

    for o in orders:
        result[o.status] = result.get(o.status, 0) + 1

    return result


@router.get("/analytics/vendor-performance")
def vendor_performance(db: Session = Depends(get_db)):

    orders = db.query(PurchaseOrder).all()

    result = {}

    for o in orders:

        if o.vendor_name not in result:
            result[o.vendor_name] = {
                "total": 0,
                "delivered": 0
            }

        result[o.vendor_name]["total"] += 1

        if o.status == "Delivered":
            result[o.vendor_name]["delivered"] += 1

    final = []

    for vendor, data in result.items():

        score = round(
            (data["delivered"] / data["total"]) * 100,
            2
        )

        final.append({
            "vendor": vendor,
            "total_orders": data["total"],
            "delivered_orders": data["delivered"],
            "reliability_score": score
        })

    return final

# DELETE PURCHASE ORDER
@router.delete("/{po_id}")
def delete_purchase_order(
    po_id: int,
    db: Session = Depends(get_db)
):

    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == po_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    db.delete(purchase_order)
    db.commit()

    return {
        "message": "Purchase Order Deleted Successfully"
    }
