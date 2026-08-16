"""
Purchase Order API Router
==========================
All PO-related endpoints:
  POST   /api/purchase-orders/            – Create new PO
  GET    /api/purchase-orders/            – List POs (with filters/pagination)
  GET    /api/purchase-orders/stats       – Summary statistics
  GET    /api/purchase-orders/{id}        – Get single PO by DB id
  GET    /api/purchase-orders/by-number/{po_number} – Get PO by human-readable PO number
  PUT    /api/purchase-orders/{id}        – Update PO (only PENDING)
  PATCH  /api/purchase-orders/{id}/status – Change PO status
  DELETE /api/purchase-orders/{id}        – Delete PO (PENDING / CANCELLED only)
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.purchase_order import POStatus
from app.routers.deps import get_current_user
from app.schemas.purchase_order import (
    POStatusUpdate,
    POSummaryStats,
    PurchaseOrderCreate,
    PurchaseOrderListOut,
    PurchaseOrderOut,
    PurchaseOrderUpdate,
)
from app.services.purchase_order_service import (
    create_purchase_order,
    delete_purchase_order,
    get_po_summary_stats,
    get_purchase_order,
    get_purchase_order_by_number,
    list_purchase_orders,
    update_po_status,
    update_purchase_order,
)

router = APIRouter(prefix="/api/purchase-orders", tags=["Purchase Orders"])


# ──────────────────────────────────────────────────────────────────────────────
# Stats (must come before /{id} to avoid route conflict)
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=POSummaryStats)
def stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Return aggregated PO statistics for the dashboard."""
    return get_po_summary_stats(db)


# ──────────────────────────────────────────────────────────────────────────────
# By PO number (must come before /{id})
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/by-number/{po_number}", response_model=PurchaseOrderOut)
def get_by_po_number(
    po_number: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Retrieve a Purchase Order using its human-readable PO number."""
    return get_purchase_order_by_number(db, po_number)


# ──────────────────────────────────────────────────────────────────────────────
# CRUD
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/", response_model=PurchaseOrderOut, status_code=status.HTTP_201_CREATED)
def create(
    po_data: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Create a new Purchase Order.

    - Validates vendor exists and is **Approved**.
    - Auto-generates a unique PO number (format: PO-YYYYMM-XXXXXX).
    - Calculates subtotal, tax, discount, and total automatically.
    - Sets initial status to **Pending**.
    """
    return create_purchase_order(db, po_data, current_user.id)


@router.get("/", response_model=dict)
def list_all(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=500),
    status_filter: Optional[POStatus] = Query(None, alias="status"),
    vendor_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    List Purchase Orders with optional filters.

    - `status`    – filter by POStatus
    - `vendor_id` – filter by vendor
    - `search`    – search by PO number or title
    """
    orders, total = list_purchase_orders(db, skip, limit, status_filter, vendor_id, search)
    return {
        "items": [PurchaseOrderListOut.model_validate(o) for o in orders],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{po_id}", response_model=PurchaseOrderOut)
def get_one(
    po_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get full details of a Purchase Order by its database ID."""
    return get_purchase_order(db, po_id)


@router.put("/{po_id}", response_model=PurchaseOrderOut)
def update(
    po_id: int,
    update_data: PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Update a Purchase Order.
    Only **PENDING** orders can be edited.
    If `items` is included, it replaces all existing line items.
    """
    return update_purchase_order(db, po_id, update_data, current_user.id)


@router.patch("/{po_id}/status", response_model=PurchaseOrderOut)
def change_status(
    po_id: int,
    status_update: POStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Transition a Purchase Order to a new status.

    Valid transitions:
    - PENDING     → APPROVED, CANCELLED
    - APPROVED    → DISPATCHED, CANCELLED
    - DISPATCHED  → DELIVERED, CANCELLED
    - DELIVERED   → COMPLETED
    """
    return update_po_status(db, po_id, status_update, current_user.id)


@router.delete("/{po_id}", status_code=status.HTTP_200_OK)
def delete(
    po_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Delete a Purchase Order (only PENDING or CANCELLED allowed)."""
    return delete_purchase_order(db, po_id)
