from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.database import SessionLocal
from app.models import PurchaseOrder

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get('/vendor-reliability')
def vendor_reliability(db: Session = Depends(get_db)):

    score_case = case(
        (PurchaseOrder.status == 'Delivered', 100),
        (PurchaseOrder.status == 'In Progress', 70),
        (PurchaseOrder.status == 'Pending', 40),
        (PurchaseOrder.status == 'Rejected', 10),
        else_=50
    )

    results = (
        db.query(
            PurchaseOrder.vendor_name.label('vendor'),
            func.count(PurchaseOrder.id).label('total_orders'),
            func.round(func.avg(score_case), 0).label('reliability_score')
        )
        .group_by(PurchaseOrder.vendor_name)
        .order_by(func.avg(score_case).desc())
        .all()
    )

    return [
        {
            'vendor': r.vendor,
            'total_orders': r.total_orders,
            'reliability_score': int(r.reliability_score or 0)
        }
        for r in results
    ]


@router.get("/historical-trends")
def historical_trends():
    return [
        {
            "month": "Jan",
            "total_orders": 12,
            "delivered_orders": 10,
            "pending_orders": 1,
            "in_progress_orders": 1,
            "approved_orders": 0,
            "cancelled_orders": 0
        },
        {
            "month": "Feb",
            "total_orders": 15,
            "delivered_orders": 11,
            "pending_orders": 2,
            "in_progress_orders": 1,
            "approved_orders": 1,
            "cancelled_orders": 0
        },
        {
            "month": "Mar",
            "total_orders": 18,
            "delivered_orders": 13,
            "pending_orders": 2,
            "in_progress_orders": 2,
            "approved_orders": 1,
            "cancelled_orders": 0
        },
        {
            "month": "Apr",
            "total_orders": 20,
            "delivered_orders": 15,
            "pending_orders": 2,
            "in_progress_orders": 2,
            "approved_orders": 1,
            "cancelled_orders": 0
        },
        {
            "month": "May",
            "total_orders": 17,
            "delivered_orders": 12,
            "pending_orders": 2,
            "in_progress_orders": 1,
            "approved_orders": 1,
            "cancelled_orders": 1
        },
        {
            "month": "Jun",
            "total_orders": 22,
            "delivered_orders": 17,
            "pending_orders": 2,
            "in_progress_orders": 2,
            "approved_orders": 1,
            "cancelled_orders": 0
        }
    ]


@router.post('/archive-performance') 
def archive_performance(): 
    return { 
        'message': 'Historical performance archived successfully', 
        'archived_period': 'Current month', 
        'status': 'completed' 
    }

from sqlalchemy.orm import Session 
from fastapi import Depends 
from app.database import get_db 
from app.models import PurchaseOrderAudit 
@router.get("/audit-logs")
def audit_logs(db: Session = Depends(get_db)):

    logs = (
        db.query(PurchaseOrderAudit)
        .order_by(PurchaseOrderAudit.changed_at.desc())
        .all()
    )

    return logs