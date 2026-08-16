from pydantic import BaseModel
from typing import List, Optional
from datetime import date


# ── KPI Summary ──────────────────────────────────────────────────────────────

class KPISummary(BaseModel):
    total_vendors: int
    active_vendors: int
    pending_vendors: int
    total_purchase_orders: int
    active_purchase_orders: int
    total_procurement_value: float
    avg_vendor_reliability_score: float
    on_time_delivery_rate: float        # percentage 0-100
    contract_compliance_rate: float     # percentage 0-100
    expiring_contracts_count: int
    overdue_orders_count: int
    total_contracts: int


# ── Trend data point ──────────────────────────────────────────────────────────

class TrendPoint(BaseModel):
    label: str          # e.g. "Jan 2024"
    value: float


class TrendSeries(BaseModel):
    name: str
    data: List[TrendPoint]


# ── Vendor category breakdown ─────────────────────────────────────────────────

class CategoryBreakdown(BaseModel):
    category: str
    count: int
    percentage: float


# ── Procurement status breakdown ──────────────────────────────────────────────

class StatusBreakdown(BaseModel):
    status: str
    count: int
    total_value: float


# ── Top vendor ────────────────────────────────────────────────────────────────

class TopVendor(BaseModel):
    vendor_id: int
    vendor_name: str
    category: str
    reliability_score: float
    on_time_delivery_rate: float
    total_orders: int
    total_value: float


# ── Recent PO ─────────────────────────────────────────────────────────────────

class RecentPurchaseOrder(BaseModel):
    id: int
    po_number: str
    vendor_name: str
    status: str
    total_amount: float
    order_date: Optional[date]
    expected_delivery: Optional[date]


# ── Delivery performance by month ─────────────────────────────────────────────

class DeliveryTrend(BaseModel):
    month: str
    on_time: int
    delayed: int
    on_time_rate: float


# ── Cost analysis ─────────────────────────────────────────────────────────────

class CostAnalysis(BaseModel):
    month: str
    total_spend: float
    approved_spend: float
    pending_spend: float


# ── Risk distribution ─────────────────────────────────────────────────────────

class RiskDistribution(BaseModel):
    risk_level: str     # "Low", "Medium", "High", "Critical"
    count: int
    percentage: float


# ── Full executive dashboard response ────────────────────────────────────────

class ExecutiveDashboard(BaseModel):
    kpi_summary: KPISummary
    vendor_categories: List[CategoryBreakdown]
    procurement_status: List[StatusBreakdown]
    top_vendors: List[TopVendor]
    recent_purchase_orders: List[RecentPurchaseOrder]
    delivery_trends: List[DeliveryTrend]
    cost_analysis: List[CostAnalysis]
    risk_distribution: List[RiskDistribution]
    monthly_po_trend: List[TrendPoint]
    reliability_trend: List[TrendPoint]


# ── Filter params ─────────────────────────────────────────────────────────────

class DashboardFilters(BaseModel):
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    vendor_category: Optional[str] = None
    procurement_status: Optional[str] = None
    top_n: int = 10
