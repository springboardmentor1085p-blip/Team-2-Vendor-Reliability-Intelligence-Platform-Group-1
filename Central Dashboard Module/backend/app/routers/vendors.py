from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.auth.dependencies import require_procurement, require_any
from app.models.user import User
from app.models.vendor import Vendor, VendorStatus
from app.models.procurement import PurchaseOrder
from app.models.performance import DeliveryRecord
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorOut, VendorDetail, VendorStats
from app.services import vendor_service as svc
from app.cache import cache_delete_pattern

router = APIRouter(prefix="/api/vendors", tags=["Vendor Management"])


@router.get("/stats", response_model=VendorStats)
def vendor_stats(db: Session = Depends(get_db), _: User = Depends(require_any)):
    rows = (
        db.query(Vendor.status, func.count(Vendor.id).label("cnt"))
        .group_by(Vendor.status).all()
    )
    status_map = {r.status.value if hasattr(r.status, "value") else str(r.status): r.cnt for r in rows}
    cat_rows = (
        db.query(Vendor.category, func.count(Vendor.id).label("cnt"))
        .group_by(Vendor.category).all()
    )
    by_cat = {
        (r.category.value if hasattr(r.category, "value") else str(r.category)): r.cnt
        for r in cat_rows
    }
    return VendorStats(
        total=sum(status_map.values()),
        approved=status_map.get("approved", 0),
        pending=status_map.get("pending", 0),
        suspended=status_map.get("suspended", 0),
        rejected=status_map.get("rejected", 0),
        by_category=by_cat,
    )


@router.get("/", response_model=List[VendorOut])
def list_vendors(
    skip: int = 0,
    limit: int = Query(100, le=500),
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    q = db.query(Vendor)
    if category:
        q = q.filter(Vendor.category == category)
    if status:
        q = q.filter(Vendor.status == status)
    if search:
        term = f"%{search}%"
        q = q.filter(
            (Vendor.name.ilike(term)) |
            (Vendor.email.ilike(term)) |
            (Vendor.contact_person.ilike(term))
        )
    return q.order_by(Vendor.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=VendorOut, status_code=201)
def create_vendor(
    data: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_procurement),
):
    return svc.create_vendor(db, data)


@router.get("/{vendor_id}/detail", response_model=VendorDetail)
def get_vendor_detail(
    vendor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    v = svc.get_vendor(db, vendor_id)
    total_orders = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id).count()
    total_spend = float(
        db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0))
        .filter(PurchaseOrder.vendor_id == vendor_id).scalar()
    )
    total_del = db.query(DeliveryRecord).filter(DeliveryRecord.vendor_id == vendor_id).count()
    on_time = db.query(DeliveryRecord).filter(
        DeliveryRecord.vendor_id == vendor_id,
        DeliveryRecord.is_on_time == True
    ).count()
    on_time_rate = round(on_time / total_del * 100, 2) if total_del else 0.0

    return VendorDetail(
        id=v.id, name=v.name, email=v.email, phone=v.phone,
        address=v.address,
        category=v.category.value if hasattr(v.category, "value") else str(v.category),
        status=v.status.value if hasattr(v.status, "value") else str(v.status),
        contact_person=v.contact_person, website=v.website, tax_id=v.tax_id,
        reliability_score=v.reliability_score, created_at=v.created_at,
        total_orders=total_orders, total_spend=total_spend,
        on_time_rate=on_time_rate, total_deliveries=total_del,
        approved_by=v.approved_by,
    )


@router.get("/{vendor_id}", response_model=VendorOut)
def get_vendor(vendor_id: int, db: Session = Depends(get_db), _: User = Depends(require_any)):
    return svc.get_vendor(db, vendor_id)


@router.put("/{vendor_id}", response_model=VendorOut)
def update_vendor(
    vendor_id: int,
    data: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_procurement),
):
    v = svc.update_vendor(db, vendor_id, data)
    cache_delete_pattern("dashboard:*")
    return v


@router.post("/{vendor_id}/approve", response_model=VendorOut)
def approve_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_procurement),
):
    return svc.approve_vendor(db, vendor_id, current_user.id)


@router.post("/{vendor_id}/suspend", response_model=VendorOut)
def suspend_vendor(vendor_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(require_procurement)):
    v = svc.get_vendor(db, vendor_id)
    v.status = VendorStatus.SUSPENDED
    db.commit(); db.refresh(v)
    cache_delete_pattern("dashboard:*")
    return v


@router.post("/{vendor_id}/reject", response_model=VendorOut)
def reject_vendor(vendor_id: int, db: Session = Depends(get_db),
                  current_user: User = Depends(require_procurement)):
    v = svc.get_vendor(db, vendor_id)
    v.status = VendorStatus.REJECTED
    db.commit(); db.refresh(v)
    cache_delete_pattern("dashboard:*")
    return v


@router.post("/{vendor_id}/recalculate-score")
def recalculate_score(vendor_id: int, db: Session = Depends(get_db),
                      _: User = Depends(require_procurement)):
    score = svc.calculate_reliability_score(db, vendor_id)
    return {"vendor_id": vendor_id, "reliability_score": score}
