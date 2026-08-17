from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.services.analytics_service import AnalyticsService

router = APIRouter()


# ── DB dependency ─────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Shared filter params ──────────────────────────────────────────────────────

def filter_params(
    start_date:     str | None = Query(None, description="ISO date YYYY-MM-DD"),
    end_date:       str | None = Query(None, description="ISO date YYYY-MM-DD"),
    vendor:         str | None = Query(None),
    department:     str | None = Query(None),
    category:       str | None = Query(None),
    status:         str | None = Query(None),
    financial_year: str | None = Query(None, description="4-digit year e.g. 2025"),
):
    return {
        "start_date":     start_date,
        "end_date":       end_date,
        "vendor":         vendor,
        "department":     department,
        "category":       category,
        "status":         status,
        "financial_year": financial_year,
    }


# ── Filter Options ────────────────────────────────────────────────────────────

@router.get(
    "/filters",
    summary="Return all dropdown filter options (vendors, categories, departments, years)",
)
def get_filter_options(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_filter_options()


# ── KPI Overview ──────────────────────────────────────────────────────────────

@router.get(
    "/kpi-overview",
    summary="Single call returning all KPI card values for the dashboard header",
)
def kpi_overview(
    db:      Session = Depends(get_db),
    filters: dict    = Depends(filter_params),
):
    return AnalyticsService(db).get_kpi_overview(**filters)


# ── Spend Analytics ───────────────────────────────────────────────────────────

@router.get("/spend/summary")
def spend_summary(
    db:      Session = Depends(get_db),
    filters: dict    = Depends(filter_params),
):
    return AnalyticsService(db).get_spend_summary(**filters)


@router.get("/spend/monthly")
def spend_monthly(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_monthly_spend()


@router.get("/spend/yearly")
def spend_yearly(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_yearly_spend()


@router.get("/spend/category")
def spend_category(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_category_spend()


@router.get("/spend/vendor")
def spend_vendor(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_vendor_spend()


# ── Purchase Order Analytics ──────────────────────────────────────────────────

@router.get("/purchase-orders")
def purchase_orders(
    db:      Session = Depends(get_db),
    filters: dict    = Depends(filter_params),
):
    return AnalyticsService(db).get_purchase_order_summary(**filters)


# ── Vendor Analytics ──────────────────────────────────────────────────────────

@router.get("/vendor-analytics")
def vendor_analytics(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_vendor_analytics()


# ── Category Analytics ────────────────────────────────────────────────────────

@router.get("/category-analytics")
def category_analytics(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_category_analytics()


# ── Contract Analytics ────────────────────────────────────────────────────────

@router.get("/contract-analytics")
def contract_analytics(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_contract_analytics()


# ── Budget Analytics ──────────────────────────────────────────────────────────

@router.get("/budget-analytics")
def budget_analytics(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_budget_analytics()


# ── Cost Savings ──────────────────────────────────────────────────────────────

@router.get("/cost-savings")
def cost_savings(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_cost_savings_analytics()
