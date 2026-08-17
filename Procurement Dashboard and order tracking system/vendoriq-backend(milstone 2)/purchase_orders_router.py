from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import date, datetime, timezone
from typing import Optional

import models
import schemas
from models import POStatus
from database import SessionLocal


router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase Orders"],
)


# ── Dependency ────────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_po_or_404(po_id: int, db: Session) -> models.PurchaseOrder:
    po = (
        db.query(models.PurchaseOrder)
        .options(joinedload(models.PurchaseOrder.vendor))
        .filter(models.PurchaseOrder.id == po_id)
        .first()
    )
    if not po:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Purchase order with id {po_id} not found.",
        )
    return po


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

# NOTE: /summary must be declared BEFORE /{id} so FastAPI doesn't try to
# parse the literal string "summary" as an integer path parameter.

@router.get(
    "/summary",
    response_model=schemas.POSummary,
    summary="Dashboard summary — counts grouped by status",
)
def get_po_summary(db: Session = Depends(get_db)):
    """
    Returns aggregate PO counts for each status value.
    Used by the frontend dashboard summary cards and charts.
    """
    rows = (
        db.query(models.PurchaseOrder.status, func.count(models.PurchaseOrder.id))
        .group_by(models.PurchaseOrder.status)
        .all()
    )
    counts = {row[0].value if hasattr(row[0], "value") else row[0]: row[1] for row in rows}

    return schemas.POSummary(
        total=sum(counts.values()),
        pending=counts.get("pending", 0),
        approved=counts.get("approved", 0),
        shipped=counts.get("shipped", 0),
        delivered=counts.get("delivered", 0),
        cancelled=counts.get("cancelled", 0),
    )


@router.get(
    "",
    response_model=list[schemas.POResponse],
    summary="List all purchase orders with optional filters",
)
def list_purchase_orders(
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
    vendor_id: Optional[int] = Query(
        None,
        description="Restrict results to a single vendor",
    ),
    db: Session = Depends(get_db),
):
    """
    Returns purchase orders, optionally filtered by status, order date range,
    and/or vendor. All filter params are combinable and optional.

    - Returns **422** if status is not a valid value.
    - Returns **422** if end_date is before start_date.
    """
    # Run all validation through the Pydantic schema — auto-raises 422 on bad input
    filters = schemas.POFilterParams(
        status=status,
        start_date=start_date,
        end_date=end_date,
        vendor_id=vendor_id,
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

    if filters.vendor_id:
        query = query.filter(models.PurchaseOrder.vendor_id == filters.vendor_id)

    return query.order_by(models.PurchaseOrder.order_date.desc()).all()


@router.get(
    "/{po_id}",
    response_model=schemas.POResponse,
    summary="Get a single purchase order by ID",
)
def get_purchase_order(po_id: int, db: Session = Depends(get_db)):
    """
    Retrieve full details of one PO including nested vendor info.

    - Returns **404** if no PO with that ID exists.
    """
    return get_po_or_404(po_id, db)


@router.post(
    "",
    response_model=schemas.POResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new purchase order",
)
def create_purchase_order(
    payload: schemas.POCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new PO against an existing vendor.

    - Returns **404** if vendor_id does not match any vendor.
    - Returns **409** if po_number is already in use.
    - Returns **422** if validation fails (quantity ≤ 0, total mismatch, etc.).
    """
    # Confirm the vendor exists
    get_vendor_or_404(payload.vendor_id, db)

    new_po = models.PurchaseOrder(
        po_number             = payload.po_number,
        vendor_id             = payload.vendor_id,
        item_description      = payload.item_description,
        quantity              = payload.quantity,
        unit_price            = payload.unit_price,
        total_amount          = payload.total_amount,
        status                = POStatus.pending,
        order_date            = payload.order_date or datetime.now(tz=timezone.utc),
        expected_delivery_date= payload.expected_delivery_date,
    )

    db.add(new_po)
    try:
        db.commit()
        db.refresh(new_po)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A purchase order with po_number '{payload.po_number}' already exists.",
        )

    # Re-fetch with vendor joined so the response has nested vendor info
    return get_po_or_404(new_po.id, db)


@router.put(
    "/{po_id}",
    response_model=schemas.POResponse,
    summary="Update a purchase order",
)
def update_purchase_order(
    po_id: int,
    payload: schemas.POUpdate,
    db: Session = Depends(get_db),
):
    """
    Partial update — only fields present in the request body are changed.

    - Returns **404** if the PO does not exist.
    - Returns **422** if the new status value is not valid.
    """
    po = get_po_or_404(po_id, db)

    update_fields = payload.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        if field == "status" and value is not None:
            setattr(po, field, POStatus(value))
        else:
            setattr(po, field, value)

    db.commit()
    db.refresh(po)

    return get_po_or_404(po.id, db)
