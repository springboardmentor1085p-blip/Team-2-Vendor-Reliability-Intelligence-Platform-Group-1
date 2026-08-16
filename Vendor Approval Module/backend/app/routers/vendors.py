from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorStatus, VendorStatusHistory
from app.schemas.vendor import (
    VendorCreate,
    VendorUpdate,
    VendorOut,
    VendorListOut,
    VendorStatusUpdate,
    StatusHistoryOut,
)
from app.core.dependencies import get_current_user, require_manager

router = APIRouter(prefix="/api/vendors", tags=["Vendors"])


# ─────────────────────────────────────────────────────────────────────────────
# HELPER
# ─────────────────────────────────────────────────────────────────────────────

def _enrich_history(history_records, db: Session):
    """Attach changed_by_name to status history records."""
    result = []
    for h in history_records:
        user = db.query(User).filter(User.id == h.changed_by).first()
        item = StatusHistoryOut(
            id=h.id,
            old_status=h.old_status,
            new_status=h.new_status,
            changed_by=h.changed_by,
            changed_by_name=user.full_name if user else None,
            remarks=h.remarks,
            changed_at=h.changed_at,
        )
        result.append(item)
    return result


# ─────────────────────────────────────────────────────────────────────────────
# VENDOR REGISTRATION  (any authenticated user can register a vendor)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/", response_model=VendorOut, status_code=status.HTTP_201_CREATED)
def create_vendor(
    payload: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Vendor).filter(Vendor.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vendor email already registered")

    vendor = Vendor(
        **payload.model_dump(),
        registered_by=current_user.id,
        status=VendorStatus.PENDING,
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


# ─────────────────────────────────────────────────────────────────────────────
# LIST VENDORS  (any authenticated user)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[VendorListOut])
def list_vendors(
    status_filter: Optional[VendorStatus] = Query(None, alias="status"),
    category_filter: Optional[str] = Query(None, alias="category"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Vendor)
    if status_filter:
        query = query.filter(Vendor.status == status_filter)
    if category_filter:
        query = query.filter(Vendor.category == category_filter)
    return query.order_by(Vendor.created_at.desc()).all()


# ─────────────────────────────────────────────────────────────────────────────
# PENDING VENDORS — convenience endpoint for the approval dashboard
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/pending", response_model=List[VendorListOut])
def list_pending_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
):
    return (
        db.query(Vendor)
        .filter(Vendor.status == VendorStatus.PENDING)
        .order_by(Vendor.created_at.asc())
        .all()
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET SINGLE VENDOR
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{vendor_id}", response_model=VendorOut)
def get_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    # Build enriched response manually so we keep the ORM vendor object
    vendor_dict = {c.name: getattr(vendor, c.name) for c in vendor.__table__.columns}
    vendor_dict["status_history"] = _enrich_history(vendor.status_history, db)
    return VendorOut(**vendor_dict)


# ─────────────────────────────────────────────────────────────────────────────
# UPDATE VENDOR PROFILE  (manager / admin)
# ─────────────────────────────────────────────────────────────────────────────

@router.put("/{vendor_id}", response_model=VendorOut)
def update_vendor(
    vendor_id: int,
    payload: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(vendor, field, value)
    vendor.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(vendor)
    return vendor


# ─────────────────────────────────────────────────────────────────────────────
# ★ MEMBER B CORE ENDPOINT: CHANGE VENDOR STATUS (Approve / Reject / Suspend)
# Only PROCUREMENT_MANAGER, SUPPLY_CHAIN_MANAGER, or ADMINISTRATOR can call this.
# ─────────────────────────────────────────────────────────────────────────────

@router.patch("/{vendor_id}/status", response_model=VendorOut)
def update_vendor_status(
    vendor_id: int,
    payload: VendorStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),   # ← RBAC enforced here
):
    """
    Change vendor status to APPROVED, REJECTED, or SUSPENDED.
    Requires role: procurement_manager | supply_chain_manager | administrator.
    Creates an immutable audit record in vendor_status_history.
    """
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    # Guard: no pointless no-op transitions
    if vendor.status == payload.status:
        raise HTTPException(
            status_code=400,
            detail=f"Vendor is already {payload.status.value}",
        )

    # Record audit trail
    history = VendorStatusHistory(
        vendor_id=vendor.id,
        old_status=vendor.status,
        new_status=payload.status,
        changed_by=current_user.id,
        remarks=payload.remarks,
    )
    db.add(history)

    # Apply status change
    vendor.status = payload.status
    vendor.reviewed_by = current_user.id
    vendor.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(vendor)

    vendor_dict = {c.name: getattr(vendor, c.name) for c in vendor.__table__.columns}
    vendor_dict["status_history"] = _enrich_history(vendor.status_history, db)
    return VendorOut(**vendor_dict)


# ─────────────────────────────────────────────────────────────────────────────
# GET STATUS HISTORY for a vendor
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{vendor_id}/status-history", response_model=List[StatusHistoryOut])
def get_status_history(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return _enrich_history(vendor.status_history, db)
