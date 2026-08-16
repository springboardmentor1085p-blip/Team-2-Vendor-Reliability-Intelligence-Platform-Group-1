"""
Dashboard aggregation service — all functions accept vendor_category filter.
Every chart responds dynamically to the selected category.
"""
from datetime import date, timedelta
from typing import Optional, List
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.models.vendor import Vendor, VendorStatus
from app.models.procurement import PurchaseOrder, ProcurementStatus
from app.models.performance import VendorPerformance, DeliveryRecord
from app.models.contract import Contract, ContractStatus
from app.schemas.dashboard import (
    KPISummary, CategoryBreakdown, StatusBreakdown,
    TopVendor, RecentPurchaseOrder, DeliveryTrend,
    CostAnalysis, RiskDistribution, TrendPoint, ExecutiveDashboard,
)
from app.cache import cache_get, cache_set
from app.config import settings


def _cache_key(prefix: str, **kwargs) -> str:
    parts = "_".join(f"{k}={v}" for k, v in sorted(kwargs.items()))
    return f"dashboard:{prefix}:{parts}"


def _risk_level(score: float) -> str:
    if score >= 80: return "Low"
    if score >= 60: return "Medium"
    if score >= 40: return "High"
    return "Critical"


def _vendor_ids_for_category(db: Session, category: Optional[str]) -> Optional[List[int]]:
    """Return list of vendor IDs for a category, or None meaning 'all vendors'."""
    if not category:
        return None
    rows = db.query(Vendor.id).filter(Vendor.category == category).all()
    return [r.id for r in rows]


# ── KPI summary ───────────────────────────────────────────────────────────────

def get_kpi_summary(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    vendor_category: Optional[str] = None,
) -> KPISummary:
    key = _cache_key("kpi", df=date_from, dt=date_to, vc=vendor_category)
    cached = cache_get(key)
    if cached:
        return KPISummary(**cached)

    today = date.today()
    vids = _vendor_ids_for_category(db, vendor_category)

    # Vendor counts — filtered by category if provided
    vq = db.query(Vendor)
    if vendor_category:
        vq = vq.filter(Vendor.category == vendor_category)
    total_vendors  = vq.count()
    active_vendors = vq.filter(Vendor.status == VendorStatus.APPROVED).count()
    pending_vendors = (
        db.query(Vendor)
        .filter(Vendor.status == 'pending')
        .filter(Vendor.category == vendor_category if vendor_category else True)
        .count()
    )

    # PO counts — filtered by category's vendors
    poq = db.query(PurchaseOrder)
    if vids is not None:
        poq = poq.filter(PurchaseOrder.vendor_id.in_(vids))
    if date_from:
        poq = poq.filter(PurchaseOrder.order_date >= date_from)
    if date_to:
        poq = poq.filter(PurchaseOrder.order_date <= date_to)
    total_pos  = poq.count()
    active_pos = db.query(PurchaseOrder).filter(
        PurchaseOrder.status.in_([ProcurementStatus.APPROVED, ProcurementStatus.ORDERED]),
        *([PurchaseOrder.vendor_id.in_(vids)] if vids is not None else []),
    ).count()

    # Total value
    tvq = db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0))
    if vids is not None:
        tvq = tvq.filter(PurchaseOrder.vendor_id.in_(vids))
    total_value = float(tvq.scalar())

    # Avg reliability — filtered by category
    arq = db.query(func.coalesce(func.avg(Vendor.reliability_score), 0))
    if vendor_category:
        arq = arq.filter(Vendor.category == vendor_category)
    avg_score = float(arq.scalar())

    # On-time delivery rate — filtered by category
    drq = db.query(DeliveryRecord)
    if vids is not None:
        drq = drq.filter(DeliveryRecord.vendor_id.in_(vids))
    total_deliveries = drq.count()
    on_time = drq.filter(DeliveryRecord.is_on_time == True).count()
    on_time_rate = (on_time / total_deliveries * 100) if total_deliveries else 0.0

    # Contract compliance — all contracts or category-filtered
    cq = db.query(Contract)
    if vids is not None:
        cq = cq.filter(Contract.vendor_id.in_(vids))
    total_contracts = cq.count()
    compliant       = cq.filter(Contract.is_compliant == True).count()
    compliance_rate = (compliant / total_contracts * 100) if total_contracts else 0.0

    expiring = cq.filter(
        Contract.status == ContractStatus.ACTIVE,
        Contract.end_date <= today + timedelta(days=30),
        Contract.end_date >= today,
    ).count()

    overdue = db.query(PurchaseOrder).filter(
        PurchaseOrder.status.in_([ProcurementStatus.ORDERED, ProcurementStatus.APPROVED]),
        PurchaseOrder.expected_delivery < today,
        *([PurchaseOrder.vendor_id.in_(vids)] if vids is not None else []),
    ).count()

    result = KPISummary(
        total_vendors=total_vendors, active_vendors=active_vendors, pending_vendors=pending_vendors,
        total_purchase_orders=total_pos, active_purchase_orders=active_pos,
        total_procurement_value=total_value,
        avg_vendor_reliability_score=round(avg_score, 2),
        on_time_delivery_rate=round(on_time_rate, 2),
        contract_compliance_rate=round(compliance_rate, 2),
        expiring_contracts_count=expiring, overdue_orders_count=overdue,
        total_contracts=total_contracts,
    )
    cache_set(key, result.model_dump(), ttl=settings.KPI_CACHE_TTL)
    return result


# ── Vendor category breakdown ─────────────────────────────────────────────────

def get_vendor_category_breakdown(db: Session) -> List[CategoryBreakdown]:
    key = _cache_key("vendor_categories")
    cached = cache_get(key)
    if cached:
        return [CategoryBreakdown(**x) for x in cached]

    rows = db.query(Vendor.category, func.count(Vendor.id).label("cnt")).group_by(Vendor.category).all()
    total = sum(r.cnt for r in rows) or 1
    result = [
        CategoryBreakdown(
            category=r.category.value if hasattr(r.category, "value") else str(r.category),
            count=r.cnt, percentage=round(r.cnt / total * 100, 2),
        )
        for r in rows
    ]
    cache_set(key, [x.model_dump() for x in result], ttl=settings.VENDOR_CACHE_TTL)
    return result


# ── Procurement status breakdown ──────────────────────────────────────────────

def get_procurement_status_breakdown(
    db: Session,
    vendor_category: Optional[str] = None,
) -> List[StatusBreakdown]:
    key = _cache_key("procurement_status", vc=vendor_category)
    cached = cache_get(key)
    if cached:
        return [StatusBreakdown(**x) for x in cached]

    vids = _vendor_ids_for_category(db, vendor_category)
    q = db.query(
        PurchaseOrder.status,
        func.count(PurchaseOrder.id).label("cnt"),
        func.coalesce(func.sum(PurchaseOrder.total_amount), 0).label("total"),
    )
    if vids is not None:
        q = q.filter(PurchaseOrder.vendor_id.in_(vids))
    rows = q.group_by(PurchaseOrder.status).all()
    result = [
        StatusBreakdown(
            status=r.status.value if hasattr(r.status, "value") else str(r.status),
            count=r.cnt, total_value=float(r.total),
        )
        for r in rows
    ]
    cache_set(key, [x.model_dump() for x in result], ttl=settings.KPI_CACHE_TTL)
    return result


# ── Top vendors ───────────────────────────────────────────────────────────────

def get_top_vendors(
    db: Session,
    top_n: int = 10,
    vendor_category: Optional[str] = None,
) -> List[TopVendor]:
    key = _cache_key("top_vendors", n=top_n, vc=vendor_category)
    cached = cache_get(key)
    if cached:
        return [TopVendor(**x) for x in cached]

    vq = db.query(Vendor).filter(Vendor.status == VendorStatus.APPROVED)
    if vendor_category:
        vq = vq.filter(Vendor.category == vendor_category)
    vendors = vq.order_by(Vendor.reliability_score.desc()).limit(top_n).all()

    result = []
    for v in vendors:
        total_orders = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == v.id).count()
        total_value  = float(
            db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0))
            .filter(PurchaseOrder.vendor_id == v.id).scalar()
        )
        deliveries = db.query(DeliveryRecord).filter(DeliveryRecord.vendor_id == v.id).count()
        on_time    = db.query(DeliveryRecord).filter(
            DeliveryRecord.vendor_id == v.id, DeliveryRecord.is_on_time == True,
        ).count()
        otr = (on_time / deliveries * 100) if deliveries else 0.0
        result.append(TopVendor(
            vendor_id=v.id, vendor_name=v.name,
            category=v.category.value if hasattr(v.category, "value") else str(v.category),
            reliability_score=round(v.reliability_score, 2),
            on_time_delivery_rate=round(otr, 2),
            total_orders=total_orders, total_value=total_value,
        ))

    cache_set(key, [x.model_dump() for x in result], ttl=settings.VENDOR_CACHE_TTL)
    return result


# ── Recent purchase orders ────────────────────────────────────────────────────

def get_recent_purchase_orders(
    db: Session,
    limit: int = 10,
    vendor_category: Optional[str] = None,
) -> List[RecentPurchaseOrder]:
    key = _cache_key("recent_pos", limit=limit, vc=vendor_category)
    cached = cache_get(key)
    if cached:
        return [RecentPurchaseOrder(**x) for x in cached]

    vids = _vendor_ids_for_category(db, vendor_category)
    q = (
        db.query(PurchaseOrder, Vendor.name.label("vendor_name"))
        .join(Vendor, PurchaseOrder.vendor_id == Vendor.id)
    )
    if vids is not None:
        q = q.filter(PurchaseOrder.vendor_id.in_(vids))
    rows = q.order_by(PurchaseOrder.created_at.desc()).limit(limit).all()

    result = [
        RecentPurchaseOrder(
            id=po.id, po_number=po.po_number, vendor_name=vendor_name,
            status=po.status.value if hasattr(po.status, "value") else str(po.status),
            total_amount=float(po.total_amount),
            order_date=po.order_date, expected_delivery=po.expected_delivery,
        )
        for po, vendor_name in rows
    ]
    cache_set(key, [x.model_dump() for x in result], ttl=settings.KPI_CACHE_TTL)
    return result


# ── Delivery trends (last 12 months) ─────────────────────────────────────────

def get_delivery_trends(
    db: Session,
    months: int = 12,
    vendor_category: Optional[str] = None,
) -> List[DeliveryTrend]:
    key = _cache_key("delivery_trends", months=months, vc=vendor_category)
    cached = cache_get(key)
    if cached:
        return [DeliveryTrend(**x) for x in cached]

    vids = _vendor_ids_for_category(db, vendor_category)
    today = date.today()
    result = []
    for i in range(months - 1, -1, -1):
        yr  = today.year if today.month - i > 0 else today.year - 1
        mo  = ((today.month - i - 1) % 12) + 1
        lbl = date(yr, mo, 1).strftime("%b %Y")

        base = db.query(DeliveryRecord).filter(
            extract("year",  DeliveryRecord.created_at) == yr,
            extract("month", DeliveryRecord.created_at) == mo,
        )
        if vids is not None:
            base = base.filter(DeliveryRecord.vendor_id.in_(vids))

        on_time = base.filter(DeliveryRecord.is_on_time == True).count()
        delayed = base.filter(DeliveryRecord.is_on_time == False).count()
        total   = on_time + delayed
        otr     = round(on_time / total * 100, 2) if total else 0.0
        result.append(DeliveryTrend(month=lbl, on_time=on_time, delayed=delayed, on_time_rate=otr))

    cache_set(key, [x.model_dump() for x in result], ttl=settings.DASHBOARD_CACHE_TTL)
    return result


# ── Cost analysis (last 12 months) ───────────────────────────────────────────

def get_cost_analysis(
    db: Session,
    months: int = 12,
    vendor_category: Optional[str] = None,
) -> List[CostAnalysis]:
    key = _cache_key("cost_analysis", months=months, vc=vendor_category)
    cached = cache_get(key)
    if cached:
        return [CostAnalysis(**x) for x in cached]

    vids = _vendor_ids_for_category(db, vendor_category)
    today = date.today()
    result = []
    for i in range(months - 1, -1, -1):
        yr  = today.year if today.month - i > 0 else today.year - 1
        mo  = ((today.month - i - 1) % 12) + 1
        lbl = date(yr, mo, 1).strftime("%b %Y")

        def monthly_sum(status_filter=None):
            q = db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0)).filter(
                extract("year",  PurchaseOrder.order_date) == yr,
                extract("month", PurchaseOrder.order_date) == mo,
            )
            if vids is not None:
                q = q.filter(PurchaseOrder.vendor_id.in_(vids))
            if status_filter:
                q = q.filter(PurchaseOrder.status == status_filter)
            return float(q.scalar())

        result.append(CostAnalysis(
            month=lbl,
            total_spend=monthly_sum(),
            approved_spend=monthly_sum(ProcurementStatus.APPROVED),
            pending_spend=monthly_sum(ProcurementStatus.PENDING),
        ))

    cache_set(key, [x.model_dump() for x in result], ttl=settings.DASHBOARD_CACHE_TTL)
    return result


# ── Risk distribution ─────────────────────────────────────────────────────────

def get_risk_distribution(
    db: Session,
    vendor_category: Optional[str] = None,
) -> List[RiskDistribution]:
    key = _cache_key("risk_distribution", vc=vendor_category)
    cached = cache_get(key)
    if cached:
        return [RiskDistribution(**x) for x in cached]

    q = db.query(Vendor.reliability_score)
    if vendor_category:
        q = q.filter(Vendor.category == vendor_category)
    vendors = q.all()

    buckets = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    for (score,) in vendors:
        buckets[_risk_level(score or 0)] += 1

    total = len(vendors) or 1
    result = [
        RiskDistribution(risk_level=level, count=cnt, percentage=round(cnt / total * 100, 2))
        for level, cnt in buckets.items()
    ]
    cache_set(key, [x.model_dump() for x in result], ttl=settings.VENDOR_CACHE_TTL)
    return result


# ── Monthly PO trend ──────────────────────────────────────────────────────────

def get_monthly_po_trend(
    db: Session,
    months: int = 12,
    vendor_category: Optional[str] = None,
) -> List[TrendPoint]:
    key = _cache_key("monthly_po_trend", months=months, vc=vendor_category)
    cached = cache_get(key)
    if cached:
        return [TrendPoint(**x) for x in cached]

    vids = _vendor_ids_for_category(db, vendor_category)
    today = date.today()
    result = []
    for i in range(months - 1, -1, -1):
        yr  = today.year if today.month - i > 0 else today.year - 1
        mo  = ((today.month - i - 1) % 12) + 1
        q   = db.query(PurchaseOrder).filter(
            extract("year",  PurchaseOrder.order_date) == yr,
            extract("month", PurchaseOrder.order_date) == mo,
        )
        if vids is not None:
            q = q.filter(PurchaseOrder.vendor_id.in_(vids))
        result.append(TrendPoint(label=date(yr, mo, 1).strftime("%b %Y"), value=float(q.count())))

    cache_set(key, [x.model_dump() for x in result], ttl=settings.DASHBOARD_CACHE_TTL)
    return result


# ── Reliability score trend ───────────────────────────────────────────────────

def get_reliability_trend(
    db: Session,
    months: int = 12,
    vendor_category: Optional[str] = None,
) -> List[TrendPoint]:
    key = _cache_key("reliability_trend", months=months, vc=vendor_category)
    cached = cache_get(key)
    if cached:
        return [TrendPoint(**x) for x in cached]

    vids = _vendor_ids_for_category(db, vendor_category)
    today = date.today()
    result = []
    for i in range(months - 1, -1, -1):
        yr = today.year if today.month - i > 0 else today.year - 1
        mo = ((today.month - i - 1) % 12) + 1
        q  = db.query(func.coalesce(func.avg(VendorPerformance.reliability_score), 0)).filter(
            VendorPerformance.period_year  == yr,
            VendorPerformance.period_month == mo,
        )
        if vids is not None:
            q = q.filter(VendorPerformance.vendor_id.in_(vids))
        avg = round(float(q.scalar()), 2)
        result.append(TrendPoint(label=date(yr, mo, 1).strftime("%b %Y"), value=avg))

    cache_set(key, [x.model_dump() for x in result], ttl=settings.DASHBOARD_CACHE_TTL)
    return result


# ── Full executive dashboard ──────────────────────────────────────────────────

def get_executive_dashboard(
    db: Session,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    vendor_category: Optional[str] = None,
    top_n: int = 10,
) -> ExecutiveDashboard:
    key = _cache_key("executive", df=date_from, dt=date_to, vc=vendor_category, n=top_n)
    cached = cache_get(key)
    if cached:
        return ExecutiveDashboard(**cached)

    result = ExecutiveDashboard(
        kpi_summary=get_kpi_summary(db, date_from, date_to, vendor_category),
        vendor_categories=get_vendor_category_breakdown(db),          # always all categories
        procurement_status=get_procurement_status_breakdown(db, vendor_category),
        top_vendors=get_top_vendors(db, top_n, vendor_category),
        recent_purchase_orders=get_recent_purchase_orders(db, 10, vendor_category),
        delivery_trends=get_delivery_trends(db, 12, vendor_category),
        cost_analysis=get_cost_analysis(db, 12, vendor_category),
        risk_distribution=get_risk_distribution(db, vendor_category),
        monthly_po_trend=get_monthly_po_trend(db, 12, vendor_category),
        reliability_trend=get_reliability_trend(db, 12, vendor_category),
    )
    cache_set(key, result.model_dump(), ttl=settings.DASHBOARD_CACHE_TTL)
    return result
