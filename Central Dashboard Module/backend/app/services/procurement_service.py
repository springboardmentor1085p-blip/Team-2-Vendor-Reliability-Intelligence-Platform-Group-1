from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.procurement import PurchaseOrder, ProcurementRequest, ProcurementStatus
from app.schemas.procurement import PurchaseOrderCreate, PurchaseOrderUpdate, ProcurementRequestCreate
from app.cache import cache_delete_pattern


def _next_po_number(db: Session) -> str:
    count = db.query(PurchaseOrder).count() + 1
    return f"PO-{datetime.utcnow().year}-{count:05d}"


def create_procurement_request(db: Session, data: ProcurementRequestCreate, user_id: int):
    req = ProcurementRequest(**data.model_dump(), requested_by=user_id)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def create_purchase_order(db: Session, data: PurchaseOrderCreate, user_id: int) -> PurchaseOrder:
    po = PurchaseOrder(
        **data.model_dump(),
        po_number=_next_po_number(db),
        created_by=user_id,
    )
    db.add(po)
    db.commit()
    db.refresh(po)
    cache_delete_pattern("dashboard:*")
    return po


def get_purchase_order(db: Session, po_id: int) -> PurchaseOrder:
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return po


def list_purchase_orders(db: Session, skip: int = 0, limit: int = 50, status=None, vendor_id=None):
    q = db.query(PurchaseOrder)
    if status:
        q = q.filter(PurchaseOrder.status == status)
    if vendor_id:
        q = q.filter(PurchaseOrder.vendor_id == vendor_id)
    return q.order_by(PurchaseOrder.created_at.desc()).offset(skip).limit(limit).all()


def update_purchase_order(db: Session, po_id: int, data: PurchaseOrderUpdate) -> PurchaseOrder:
    po = get_purchase_order(db, po_id)
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(po, field, val)
    db.commit()
    db.refresh(po)
    cache_delete_pattern("dashboard:*")
    return po
