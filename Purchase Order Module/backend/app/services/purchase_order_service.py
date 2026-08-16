"""
Purchase Order Service
======================
All business logic for creating, reading, updating, and status-transitioning
Purchase Orders.  The router layer only handles HTTP concerns; all DB
interactions live here.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import extract, func
from sqlalchemy.orm import Session, joinedload

from app.models.purchase_order import POItem, POStatus, POStatusHistory, PurchaseOrder
from app.models.vendor import Vendor, VendorStatus
from app.schemas.purchase_order import (
    POStatusUpdate,
    PurchaseOrderCreate,
    PurchaseOrderUpdate,
)
from app.services.po_id_generator import generate_po_number

# ──────────────────────────────────────────────────────────────────────────────
# Valid status transitions
# ──────────────────────────────────────────────────────────────────────────────

VALID_TRANSITIONS = {
    POStatus.PENDING: [POStatus.APPROVED, POStatus.CANCELLED],
    POStatus.APPROVED: [POStatus.DISPATCHED, POStatus.CANCELLED],
    POStatus.DISPATCHED: [POStatus.DELIVERED, POStatus.CANCELLED],
    POStatus.DELIVERED: [POStatus.COMPLETED],
    POStatus.COMPLETED: [],
    POStatus.CANCELLED: [],
}


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _calculate_totals(
    items_data: list,
    tax_rate: Decimal,
    discount_amount: Decimal,
) -> Tuple[Decimal, Decimal, Decimal]:
    """Returns (subtotal, tax_amount, total_amount)."""
    subtotal = sum(
        Decimal(str(item.quantity)) * Decimal(str(item.unit_price))
        for item in items_data
    )
    tax_amount = (subtotal * Decimal(str(tax_rate)) / Decimal("100")).quantize(
        Decimal("0.01")
    )
    total_amount = (subtotal + tax_amount - Decimal(str(discount_amount))).quantize(
        Decimal("0.01")
    )
    return subtotal, tax_amount, total_amount


def _load_full_po(db: Session, po_id: int) -> PurchaseOrder:
    po = (
        db.query(PurchaseOrder)
        .options(
            joinedload(PurchaseOrder.vendor),
            joinedload(PurchaseOrder.created_by_user),
            joinedload(PurchaseOrder.approved_by_user),
            joinedload(PurchaseOrder.items),
            joinedload(PurchaseOrder.status_history),
        )
        .filter(PurchaseOrder.id == po_id)
        .first()
    )
    if not po:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Purchase Order with id={po_id} not found",
        )
    return po


# ──────────────────────────────────────────────────────────────────────────────
# CRUD
# ──────────────────────────────────────────────────────────────────────────────

def create_purchase_order(
    db: Session, po_data: PurchaseOrderCreate, current_user_id: int
) -> PurchaseOrder:
    """Create a new PO with auto-generated PO number."""

    # Validate vendor exists and is approved
    vendor = db.query(Vendor).filter(Vendor.id == po_data.vendor_id).first()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor with id={po_data.vendor_id} not found",
        )
    if vendor.status != VendorStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vendor '{vendor.company_name}' is not approved. "
                   f"Current status: {vendor.status}",
        )

    # Generate unique PO number
    po_number = generate_po_number(db)

    # Calculate financials
    subtotal, tax_amount, total_amount = _calculate_totals(
        po_data.items,
        po_data.tax_rate,
        po_data.discount_amount,
    )

    # Build PO object
    po = PurchaseOrder(
        po_number=po_number,
        vendor_id=po_data.vendor_id,
        created_by=current_user_id,
        title=po_data.title,
        description=po_data.description,
        priority=po_data.priority,
        status=POStatus.PENDING,
        subtotal=subtotal,
        tax_rate=po_data.tax_rate,
        tax_amount=tax_amount,
        discount_amount=po_data.discount_amount,
        total_amount=total_amount,
        currency=po_data.currency,
        required_date=po_data.required_date,
        expected_delivery_date=po_data.expected_delivery_date,
        delivery_address=po_data.delivery_address,
        shipping_method=po_data.shipping_method,
        internal_notes=po_data.internal_notes,
        vendor_notes=po_data.vendor_notes,
    )
    db.add(po)
    db.flush()  # get po.id without committing

    # Add line items
    for item_data in po_data.items:
        item = POItem(
            purchase_order_id=po.id,
            item_code=item_data.item_code,
            item_name=item_data.item_name,
            description=item_data.description,
            quantity=item_data.quantity,
            unit=item_data.unit,
            unit_price=item_data.unit_price,
            total_price=Decimal(str(item_data.quantity)) * Decimal(str(item_data.unit_price)),
            notes=item_data.notes,
        )
        db.add(item)

    # Initial status history entry
    history = POStatusHistory(
        purchase_order_id=po.id,
        changed_by=current_user_id,
        previous_status=None,
        new_status=POStatus.PENDING,
        remarks="Purchase Order created",
    )
    db.add(history)

    db.commit()
    db.refresh(po)
    return _load_full_po(db, po.id)


def get_purchase_order(db: Session, po_id: int) -> PurchaseOrder:
    return _load_full_po(db, po_id)


def get_purchase_order_by_number(db: Session, po_number: str) -> PurchaseOrder:
    po = (
        db.query(PurchaseOrder)
        .filter(PurchaseOrder.po_number == po_number)
        .first()
    )
    if not po:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Purchase Order '{po_number}' not found",
        )
    return _load_full_po(db, po.id)


def list_purchase_orders(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status_filter: Optional[POStatus] = None,
    vendor_id: Optional[int] = None,
    search: Optional[str] = None,
) -> Tuple[List[PurchaseOrder], int]:
    """Return (list_of_POs, total_count)."""
    query = db.query(PurchaseOrder).options(
        joinedload(PurchaseOrder.vendor)
    )

    if status_filter:
        query = query.filter(PurchaseOrder.status == status_filter)
    if vendor_id:
        query = query.filter(PurchaseOrder.vendor_id == vendor_id)
    if search:
        like = f"%{search}%"
        query = query.filter(
            PurchaseOrder.po_number.ilike(like)
            | PurchaseOrder.title.ilike(like)
        )

    total = query.count()
    orders = (
        query.order_by(PurchaseOrder.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return orders, total


def update_purchase_order(
    db: Session,
    po_id: int,
    update_data: PurchaseOrderUpdate,
    current_user_id: int,
) -> PurchaseOrder:
    po = _load_full_po(db, po_id)

    if po.status not in (POStatus.PENDING,):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Purchase Order in '{po.status}' status cannot be edited. "
                   "Only PENDING orders can be modified.",
        )

    update_fields = update_data.model_dump(exclude_unset=True, exclude={"items"})
    for field, value in update_fields.items():
        setattr(po, field, value)

    # If items are provided, replace them
    if update_data.items is not None:
        # Delete existing items
        db.query(POItem).filter(POItem.purchase_order_id == po.id).delete()
        for item_data in update_data.items:
            item = POItem(
                purchase_order_id=po.id,
                item_code=item_data.item_code,
                item_name=item_data.item_name,
                description=item_data.description,
                quantity=item_data.quantity,
                unit=item_data.unit,
                unit_price=item_data.unit_price,
                total_price=Decimal(str(item_data.quantity)) * Decimal(str(item_data.unit_price)),
                notes=item_data.notes,
            )
            db.add(item)

        # Recalculate totals
        tax_rate = update_data.tax_rate if update_data.tax_rate is not None else po.tax_rate
        discount = update_data.discount_amount if update_data.discount_amount is not None else po.discount_amount
        subtotal, tax_amount, total_amount = _calculate_totals(
            update_data.items, tax_rate, discount
        )
        po.subtotal = subtotal
        po.tax_amount = tax_amount
        po.total_amount = total_amount

    db.commit()
    return _load_full_po(db, po.id)


def update_po_status(
    db: Session,
    po_id: int,
    status_update: POStatusUpdate,
    current_user_id: int,
) -> PurchaseOrder:
    po = _load_full_po(db, po_id)

    allowed_next = VALID_TRANSITIONS.get(po.status, [])
    if status_update.status not in allowed_next:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Cannot transition from '{po.status}' to '{status_update.status}'. "
                f"Allowed transitions: {[s.value for s in allowed_next] or 'none'}"
            ),
        )

    previous_status = po.status
    po.status = status_update.status
    now = datetime.utcnow()

    # Set relevant timestamps
    if status_update.status == POStatus.APPROVED:
        po.approved_by = current_user_id
        po.approved_at = now
    elif status_update.status == POStatus.DISPATCHED:
        po.dispatched_at = now
        if status_update.tracking_number:
            po.tracking_number = status_update.tracking_number
    elif status_update.status == POStatus.DELIVERED:
        po.delivered_at = now
        if status_update.actual_delivery_date:
            po.actual_delivery_date = status_update.actual_delivery_date
        else:
            po.actual_delivery_date = now

    # Record history
    history = POStatusHistory(
        purchase_order_id=po.id,
        changed_by=current_user_id,
        previous_status=previous_status,
        new_status=status_update.status,
        remarks=status_update.remarks,
    )
    db.add(history)
    db.commit()
    return _load_full_po(db, po.id)


def delete_purchase_order(db: Session, po_id: int) -> dict:
    po = _load_full_po(db, po_id)
    if po.status not in (POStatus.PENDING, POStatus.CANCELLED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PENDING or CANCELLED orders can be deleted.",
        )
    db.delete(po)
    db.commit()
    return {"message": f"Purchase Order {po.po_number} deleted successfully"}


def get_po_summary_stats(db: Session) -> dict:
    """Return aggregate statistics for the dashboard."""
    now = datetime.utcnow()

    counts = (
        db.query(PurchaseOrder.status, func.count(PurchaseOrder.id))
        .group_by(PurchaseOrder.status)
        .all()
    )
    status_map = {s: c for s, c in counts}

    total_value = db.query(func.sum(PurchaseOrder.total_amount)).scalar() or Decimal("0")

    # This month
    month_query = db.query(PurchaseOrder).filter(
        extract("year", PurchaseOrder.created_at) == now.year,
        extract("month", PurchaseOrder.created_at) == now.month,
    )
    this_month_orders = month_query.count()
    this_month_value = (
        db.query(func.sum(PurchaseOrder.total_amount))
        .filter(
            extract("year", PurchaseOrder.created_at) == now.year,
            extract("month", PurchaseOrder.created_at) == now.month,
        )
        .scalar()
        or Decimal("0")
    )

    return {
        "total_orders": sum(status_map.values()),
        "pending": status_map.get(POStatus.PENDING, 0),
        "approved": status_map.get(POStatus.APPROVED, 0),
        "dispatched": status_map.get(POStatus.DISPATCHED, 0),
        "delivered": status_map.get(POStatus.DELIVERED, 0),
        "completed": status_map.get(POStatus.COMPLETED, 0),
        "cancelled": status_map.get(POStatus.CANCELLED, 0),
        "total_value": total_value,
        "this_month_orders": this_month_orders,
        "this_month_value": this_month_value,
    }
