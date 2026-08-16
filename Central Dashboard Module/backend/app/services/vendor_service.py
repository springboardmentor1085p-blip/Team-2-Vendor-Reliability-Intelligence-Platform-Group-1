from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.vendor import Vendor, VendorStatus
from app.models.performance import DeliveryRecord, VendorPerformance
from app.schemas.vendor import VendorCreate, VendorUpdate
from app.cache import cache_delete_pattern


def create_vendor(db: Session, data: VendorCreate, approved_by: int = None) -> Vendor:
    if db.query(Vendor).filter(Vendor.email == data.email).first():
        raise HTTPException(status_code=400, detail="Vendor email already registered")
    vendor = Vendor(**data.model_dump())
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    cache_delete_pattern("dashboard:*")
    return vendor


def get_vendor(db: Session, vendor_id: int) -> Vendor:
    v = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return v


def list_vendors(db: Session, skip: int = 0, limit: int = 50, category=None, status=None):
    q = db.query(Vendor)
    if category:
        q = q.filter(Vendor.category == category)
    if status:
        q = q.filter(Vendor.status == status)
    return q.offset(skip).limit(limit).all()


def update_vendor(db: Session, vendor_id: int, data: VendorUpdate) -> Vendor:
    v = get_vendor(db, vendor_id)
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(v, field, val)
    db.commit()
    db.refresh(v)
    cache_delete_pattern("dashboard:*")
    return v


def approve_vendor(db: Session, vendor_id: int, approver_id: int) -> Vendor:
    v = get_vendor(db, vendor_id)
    v.status = VendorStatus.APPROVED
    v.approved_by = approver_id
    db.commit()
    db.refresh(v)
    cache_delete_pattern("dashboard:*")
    return v


def calculate_reliability_score(db: Session, vendor_id: int) -> float:
    """
    Weighted reliability score:
      40% on-time delivery rate
      25% quality rating (normalised to 100)
      20% order completion rate
      15% communication score (normalised to 100)
    """
    perf = (
        db.query(VendorPerformance)
        .filter(VendorPerformance.vendor_id == vendor_id)
        .order_by(VendorPerformance.period_year.desc(), VendorPerformance.period_month.desc())
        .limit(6)
        .all()
    )
    if not perf:
        return 0.0

    def avg(attr):
        vals = [getattr(p, attr) for p in perf if getattr(p, attr) is not None]
        return sum(vals) / len(vals) if vals else 0.0

    total_orders = sum(p.total_orders or 0 for p in perf)
    on_time = sum(p.on_time_deliveries or 0 for p in perf)
    otr = (on_time / total_orders * 100) if total_orders else 0.0

    quality_norm = avg("quality_rating") / 5 * 100
    comm_norm = avg("communication_score") / 5 * 100
    completion = avg("order_completion_rate")

    score = (
        otr * 0.40
        + quality_norm * 0.25
        + completion * 0.20
        + comm_norm * 0.15
    )
    score = round(min(max(score, 0.0), 100.0), 2)

    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if vendor:
        vendor.reliability_score = score
        db.commit()
    cache_delete_pattern("dashboard:*")
    return score
