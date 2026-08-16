"""
Dashboard & Analytics router — every endpoint accepts vendor_category
so ALL charts filter dynamically per category.
"""
from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from pydantic import BaseModel

from app.database import get_db
from app.auth.dependencies import require_any
from app.models.user import User
from app.models.vendor import Vendor, VendorStatus
from app.models.procurement import PurchaseOrder, ProcurementStatus
from app.models.performance import DeliveryRecord, VendorPerformance
from app.models.contract import Contract
from app.schemas.dashboard import (
    ExecutiveDashboard, KPISummary, CategoryBreakdown,
    StatusBreakdown, TopVendor, RecentPurchaseOrder,
    DeliveryTrend, CostAnalysis, RiskDistribution, TrendPoint,
)
from app.services import dashboard_service as svc

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Analytics"])


# ── Drill-down schemas ────────────────────────────────────────────────────────

class VendorDrillDown(BaseModel):
    vendor_id: int
    vendor_name: str
    category: str
    status: str
    reliability_score: float
    total_orders: int
    total_spend: float
    on_time_rate: float
    total_deliveries: int
    avg_quality: float
    monthly_orders: List[TrendPoint]
    recent_orders: List[RecentPurchaseOrder]


class CategoryDrillDown(BaseModel):
    category: str
    vendor_count: int
    avg_reliability: float
    total_spend: float
    total_orders: int
    on_time_rate: float
    vendors: List[TopVendor]
    monthly_spend: List[TrendPoint]


# ── Executive dashboard ───────────────────────────────────────────────────────

@router.get("/executive", response_model=ExecutiveDashboard)
def executive_dashboard(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    vendor_category: Optional[str] = Query(None),
    top_n: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    return svc.get_executive_dashboard(db, date_from, date_to, vendor_category, top_n)


# ── Individual widget endpoints — all accept vendor_category ─────────────────

@router.get("/kpi", response_model=KPISummary)
def kpi_summary(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    vendor_category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    return svc.get_kpi_summary(db, date_from, date_to, vendor_category)


@router.get("/vendor-categories", response_model=List[CategoryBreakdown])
def vendor_categories(
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    return svc.get_vendor_category_breakdown(db)


@router.get("/procurement-status", response_model=List[StatusBreakdown])
def procurement_status(
    vendor_category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    return svc.get_procurement_status_breakdown(db, vendor_category)


@router.get("/top-vendors", response_model=List[TopVendor])
def top_vendors(
    top_n: int = Query(10, ge=1, le=50),
    vendor_category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    return svc.get_top_vendors(db, top_n, vendor_category)


@router.get("/recent-orders", response_model=List[RecentPurchaseOrder])
def recent_orders(
    limit: int = Query(10, ge=1, le=50),
    vendor_id: Optional[int] = Query(None),
    vendor_category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    if vendor_id:
        rows = (
            db.query(PurchaseOrder, Vendor.name.label("vname"))
            .join(Vendor, PurchaseOrder.vendor_id == Vendor.id)
            .filter(PurchaseOrder.vendor_id == vendor_id)
            .order_by(PurchaseOrder.created_at.desc()).limit(limit).all()
        )
        return [
            RecentPurchaseOrder(
                id=po.id, po_number=po.po_number, vendor_name=vname,
                status=po.status.value if hasattr(po.status, "value") else str(po.status),
                total_amount=float(po.total_amount),
                order_date=po.order_date, expected_delivery=po.expected_delivery,
            )
            for po, vname in rows
        ]
    return svc.get_recent_purchase_orders(db, limit, vendor_category)


@router.get("/delivery-trends", response_model=List[DeliveryTrend])
def delivery_trends(
    months: int = Query(12, ge=1, le=24),
    vendor_category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    return svc.get_delivery_trends(db, months, vendor_category)


@router.get("/cost-analysis", response_model=List[CostAnalysis])
def cost_analysis(
    months: int = Query(12, ge=1, le=24),
    vendor_category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    return svc.get_cost_analysis(db, months, vendor_category)


@router.get("/risk-distribution", response_model=List[RiskDistribution])
def risk_distribution(
    vendor_category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    return svc.get_risk_distribution(db, vendor_category)


@router.get("/monthly-po-trend", response_model=List[TrendPoint])
def monthly_po_trend(
    months: int = Query(12, ge=1, le=24),
    vendor_category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    return svc.get_monthly_po_trend(db, months, vendor_category)


@router.get("/reliability-trend", response_model=List[TrendPoint])
def reliability_trend(
    months: int = Query(12, ge=1, le=24),
    vendor_category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    return svc.get_reliability_trend(db, months, vendor_category)


# ── Drill-down endpoints ──────────────────────────────────────────────────────

@router.get("/drill/vendor/{vendor_id}", response_model=VendorDrillDown)
def vendor_drilldown(
    vendor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    v = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not v:
        raise HTTPException(404, "Vendor not found")

    total_orders = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id).count()
    total_spend  = float(
        db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0))
        .filter(PurchaseOrder.vendor_id == vendor_id).scalar()
    )
    total_del = db.query(DeliveryRecord).filter(DeliveryRecord.vendor_id == vendor_id).count()
    on_time   = db.query(DeliveryRecord).filter(
        DeliveryRecord.vendor_id == vendor_id, DeliveryRecord.is_on_time == True
    ).count()
    on_time_rate = round(on_time / total_del * 100, 2) if total_del else 0.0
    avg_quality  = float(
        db.query(func.coalesce(func.avg(DeliveryRecord.quality_score), 0))
        .filter(DeliveryRecord.vendor_id == vendor_id).scalar()
    )

    today = date.today()
    monthly_orders = []
    for i in range(11, -1, -1):
        yr  = today.year if today.month - i > 0 else today.year - 1
        mo  = ((today.month - i - 1) % 12) + 1
        cnt = db.query(PurchaseOrder).filter(
            PurchaseOrder.vendor_id == vendor_id,
            extract("year",  PurchaseOrder.order_date) == yr,
            extract("month", PurchaseOrder.order_date) == mo,
        ).count()
        monthly_orders.append(TrendPoint(label=date(yr, mo, 1).strftime("%b %Y"), value=float(cnt)))

    recent_rows = (
        db.query(PurchaseOrder, Vendor.name.label("vname"))
        .join(Vendor, PurchaseOrder.vendor_id == Vendor.id)
        .filter(PurchaseOrder.vendor_id == vendor_id)
        .order_by(PurchaseOrder.created_at.desc()).limit(5).all()
    )
    recent_pos = [
        RecentPurchaseOrder(
            id=po.id, po_number=po.po_number, vendor_name=vname,
            status=po.status.value if hasattr(po.status, "value") else str(po.status),
            total_amount=float(po.total_amount),
            order_date=po.order_date, expected_delivery=po.expected_delivery,
        )
        for po, vname in recent_rows
    ]

    return VendorDrillDown(
        vendor_id=v.id, vendor_name=v.name,
        category=v.category.value if hasattr(v.category, "value") else str(v.category),
        status=v.status.value if hasattr(v.status, "value") else str(v.status),
        reliability_score=v.reliability_score,
        total_orders=total_orders, total_spend=total_spend,
        on_time_rate=on_time_rate, total_deliveries=total_del,
        avg_quality=round(avg_quality, 2),
        monthly_orders=monthly_orders, recent_orders=recent_pos,
    )


@router.get("/drill/category/{category}", response_model=CategoryDrillDown)
def category_drilldown(
    category: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_any),
):
    vendors   = db.query(Vendor).filter(Vendor.category == category).all()
    vids      = [v.id for v in vendors]
    v_count   = len(vendors)
    avg_rel   = float(
        db.query(func.coalesce(func.avg(Vendor.reliability_score), 0))
        .filter(Vendor.category == category).scalar()
    )
    total_spend = total_orders = total_del = on_time_total = 0
    if vids:
        total_spend  = float(
            db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0))
            .filter(PurchaseOrder.vendor_id.in_(vids)).scalar()
        )
        total_orders = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id.in_(vids)).count()
        total_del    = db.query(DeliveryRecord).filter(DeliveryRecord.vendor_id.in_(vids)).count()
        on_time_total = db.query(DeliveryRecord).filter(
            DeliveryRecord.vendor_id.in_(vids), DeliveryRecord.is_on_time == True
        ).count()
    on_time_rate = round(on_time_total / total_del * 100, 2) if total_del else 0.0

    vendor_list = []
    for v in sorted(vendors, key=lambda x: x.reliability_score, reverse=True)[:10]:
        v_ord = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == v.id).count()
        v_spd = float(
            db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0))
            .filter(PurchaseOrder.vendor_id == v.id).scalar()
        )
        v_del = db.query(DeliveryRecord).filter(DeliveryRecord.vendor_id == v.id).count()
        v_ot  = db.query(DeliveryRecord).filter(
            DeliveryRecord.vendor_id == v.id, DeliveryRecord.is_on_time == True
        ).count()
        vendor_list.append(TopVendor(
            vendor_id=v.id, vendor_name=v.name,
            category=v.category.value if hasattr(v.category, "value") else str(v.category),
            reliability_score=round(v.reliability_score, 2),
            on_time_delivery_rate=round(v_ot / v_del * 100, 2) if v_del else 0.0,
            total_orders=v_ord, total_value=v_spd,
        ))

    today = date.today()
    monthly_spend = []
    for i in range(11, -1, -1):
        yr  = today.year if today.month - i > 0 else today.year - 1
        mo  = ((today.month - i - 1) % 12) + 1
        spd = 0.0
        if vids:
            spd = float(
                db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0))
                .filter(
                    PurchaseOrder.vendor_id.in_(vids),
                    extract("year",  PurchaseOrder.order_date) == yr,
                    extract("month", PurchaseOrder.order_date) == mo,
                ).scalar()
            )
        monthly_spend.append(TrendPoint(label=date(yr, mo, 1).strftime("%b %Y"), value=round(spd, 2)))

    return CategoryDrillDown(
        category=category, vendor_count=v_count,
        avg_reliability=round(avg_rel, 2),
        total_spend=total_spend, total_orders=total_orders,
        on_time_rate=on_time_rate, vendors=vendor_list,
        monthly_spend=monthly_spend,
    )
