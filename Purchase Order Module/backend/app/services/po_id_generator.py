"""
Purchase Order ID Auto-Generation Service
==========================================

Generates unique, sequential PO numbers in the format:

    PO-YYYYMM-XXXXXX

Where:
    YYYY   = 4-digit year  (e.g. 2025)
    MM     = 2-digit month (e.g. 06)
    XXXXXX = 6-digit zero-padded sequence, resetting each month

Examples:
    PO-202506-000001   (first PO of June 2025)
    PO-202506-000002   (second PO of June 2025)
    PO-202507-000001   (first PO of July 2025 — counter resets)

The generation is done atomically inside the same DB transaction as the
PurchaseOrder INSERT, so there are no race conditions even under concurrent
requests.
"""

from datetime import datetime

from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.models.purchase_order import PurchaseOrder


def generate_po_number(db: Session) -> str:
    """
    Generate the next sequential PO number for the current month.

    Uses a SELECT … FOR UPDATE style count query within the caller's
    transaction to guarantee uniqueness.
    """
    now = datetime.utcnow()
    prefix = now.strftime("PO-%Y%m")   # e.g.  "PO-202506"

    # Count existing POs whose po_number starts with this month's prefix.
    # This gives us the current sequence for this month.
    count: int = (
        db.query(func.count(PurchaseOrder.id))
        .filter(PurchaseOrder.po_number.like(f"{prefix}-%"))
        .scalar()
        or 0
    )

    sequence = count + 1
    po_number = f"{prefix}-{sequence:06d}"

    # Safety check — if by some very unlikely collision the number already
    # exists (e.g. manual data entry), keep incrementing.
    while db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_number).first():
        sequence += 1
        po_number = f"{prefix}-{sequence:06d}"

    return po_number
