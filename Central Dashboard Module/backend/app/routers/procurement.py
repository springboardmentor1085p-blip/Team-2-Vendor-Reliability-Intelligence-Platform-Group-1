from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import require_procurement, require_any
from app.models.user import User
from app.schemas.procurement import (
    PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrderOut,
    ProcurementRequestCreate,
)
from app.services import procurement_service as svc

router = APIRouter(prefix="/api/procurement", tags=["Procurement Management"])


@router.post("/requests", status_code=201)
def create_request(
    data: ProcurementRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_procurement),
):
    return svc.create_procurement_request(db, data, current_user.id)


@router.post("/orders", response_model=PurchaseOrderOut, status_code=201)
def create_po(
    data: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_procurement),
):
    return svc.create_purchase_order(db, data, current_user.id)


@router.get("/orders", response_model=List[PurchaseOrderOut])
def list_orders(
    skip: int = 0,
    limit: int = Query(50, le=200),
    status: Optional[str] = None,
    vendor_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    return svc.list_purchase_orders(db, skip, limit, status, vendor_id)


@router.get("/orders/{po_id}", response_model=PurchaseOrderOut)
def get_order(po_id: int, db: Session = Depends(get_db), _: User = Depends(require_any)):
    return svc.get_purchase_order(db, po_id)


@router.put("/orders/{po_id}", response_model=PurchaseOrderOut)
def update_order(
    po_id: int,
    data: PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_procurement),
):
    return svc.update_purchase_order(db, po_id, data)
