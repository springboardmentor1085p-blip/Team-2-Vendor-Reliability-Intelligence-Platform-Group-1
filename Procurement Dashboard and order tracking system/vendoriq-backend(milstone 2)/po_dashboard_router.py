"""
po_dashboard_router.py — Member 2, Milestone 2.

Legacy dashboard read endpoints under /api/po.
These sit alongside the full CRUD router at /purchase-orders and give
the Angular dashboard the same aggregated views it already calls.

All write operations (create / update) live in purchase_orders_router.py.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import date, datetime, timezone
from typing import Optional

import models
import schemas
from models import POStatus
from database import SessionLocal


router = APIRouter(prefix="/api/po", tags=["PO Dashboard"])


# ── Dependency ────────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_vendor_or_404(vendor_id: int, db: Session) -> models.Vendor:
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor with id {vendor_id} not found.",
        )
    return vendor


def _day_start(d: date) -> datetime:
    return datetime(d.year, d.month, d.day, 0, 0, 0, tzinfo=timezone.utc)


def _day_end(d: date) -> datetime:
    return datetime(d.year, d.month, d.day, 23, 59, 59, tzinfo=timezone.utc)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "/summary",
    response_model=schemas.POSummary,
    summary="Dashboard summary counts (grouped by status)",
)
def get_po_summary(db: Session = Depends(get_db)):
    """
    Returns aggregate PO counts for all 5 status values.
    Used by the frontend summary cards and pie/bar chart.
    """
    rows = (
        db.query(models.PurchaseOrder.status, func.count(models.PurchaseOrder.id))
        .group_by(models.PurchaseOrder.status)
        .all()
    )
    counts = {
        (row[0].value if hasattr(row[0], "value") else row[0]): row[1]
        for row in rows
    }

    return schemas.POSummary(
        total=sum(counts.values()),
        pending=counts.get("pending", 0),
        approved=counts.get("approved", 0),
        shipped=counts.get("shipped", 0),
        delivered=counts.get("delivered", 0),
        cancelled=counts.get("cancelled", 0),
    )


@router.get(
    "/history",
    response_model=list[schemas.POResponse],
    summary="PO history with optional filters",
)
def get_po_history(
    status: Optional[str] = Query(
        None,
        description="Filter by status: pending | approved | shipped | delivered | cancelled",
    ),
    start_date: Optional[date] = Query(
        None,
        description="Lower bound on order_date (YYYY-MM-DD, inclusive)",
    ),
    end_date: Optional[date] = Query(
        None,
        description="Upper bound on order_date (YYYY-MM-DD, inclusive)",
    ),
    db: Session = Depends(get_db),
):
    """
    Returns all POs, optionally filtered by status and order date range.
    - Returns **422** for invalid status or reversed date range.
    """
    filters = schemas.POFilterParams(
        status=status,
        start_date=start_date,
        end_date=end_date,
    )

    query = (
        db.query(models.PurchaseOrder)
        .options(joinedload(models.PurchaseOrder.vendor))
    )

    if filters.status:
        query = query.filter(models.PurchaseOrder.status == POStatus(filters.status))

    if filters.start_date:
        query = query.filter(
            models.PurchaseOrder.order_date >= _day_start(filters.start_date)
        )

    if filters.end_date:
        query = query.filter(
            models.PurchaseOrder.order_date <= _day_end(filters.end_date)
        )

    return query.order_by(models.PurchaseOrder.order_date.desc()).all()


@router.get(
    "/vendor/{vendor_id}",
    response_model=list[schemas.POResponse],
    summary="All POs for a specific vendor",
)
def get_po_by_vendor(vendor_id: int, db: Session = Depends(get_db)):
    """
    Returns all POs for the given vendor.
    - Returns **404** if the vendor does not exist.
    - Returns **[]** if the vendor exists but has no POs.
    """
    get_vendor_or_404(vendor_id, db)

    return (
        db.query(models.PurchaseOrder)
        .options(joinedload(models.PurchaseOrder.vendor))
        .filter(models.PurchaseOrder.vendor_id == vendor_id)
        .order_by(models.PurchaseOrder.order_date.desc())
        .all()
    )
