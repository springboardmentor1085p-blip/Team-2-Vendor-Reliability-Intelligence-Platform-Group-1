from datetime import date, timedelta
from sqlalchemy import Integer, func
from sqlalchemy.orm import Session
from app.models.spend import (
    PurchaseOrder, Vendor, ProcurementCategory,
    Contract, Budget, CostSaving, Department
)


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    # ── Filter helpers ────────────────────────────────────────────────────────

    def _apply_filters(
        self, query,
        start_date=None, end_date=None,
        vendor=None, department=None,
        category=None, status=None,
        financial_year=None,
    ):
        if start_date:
            query = query.filter(PurchaseOrder.order_date >= start_date)
        if end_date:
            query = query.filter(PurchaseOrder.order_date <= end_date)
        if vendor:
            query = query.filter(Vendor.name == vendor)
        if department:
            query = query.filter(Department.name == department)
        if category:
            query = query.filter(ProcurementCategory.name == category)
        if status:
            query = query.filter(PurchaseOrder.status == status)
        if financial_year:
            query = query.filter(
                PurchaseOrder.order_date >= date(int(financial_year), 1, 1),
                PurchaseOrder.order_date <= date(int(financial_year), 12, 31),
            )
        return query

    # ── Filter options (for dropdowns) ────────────────────────────────────────

    def get_filter_options(self):
        vendors = [
            {"id": v.id, "name": v.name}
            for v in self.db.query(Vendor).filter(Vendor.active == 1).order_by(Vendor.name).all()
        ]
        categories = [
            {"id": c.id, "name": c.name}
            for c in self.db.query(ProcurementCategory).order_by(ProcurementCategory.name).all()
        ]
        departments = [
            {"id": d.id, "name": d.name}
            for d in self.db.query(Department).order_by(Department.name).all()
        ]
        years = [
            row[0] for row in
            self.db.query(
                func.strftime("%Y", PurchaseOrder.order_date)
            ).distinct().order_by(
                func.strftime("%Y", PurchaseOrder.order_date).desc()
            ).all()
        ]
        return {
            "vendors": vendors,
            "categories": categories,
            "departments": departments,
            "financial_years": years,
            "statuses": ["Pending", "Approved", "Completed", "Rejected", "Cancelled"],
        }

    # ── KPI Overview (single call for all dashboard cards) ────────────────────

    def get_kpi_overview(self, **filters):
        # Spend
        spend = self.get_spend_summary(**filters)

        # Purchase orders
        po = self.get_purchase_order_summary(**filters)

        # Active vendors
        active_vendors = self.db.query(Vendor).filter(Vendor.active == 1).count()

        # Contracts
        contract = self.get_contract_analytics()

        # Budget
        budget = self.get_budget_analytics()

        # Savings
        savings = self.get_cost_savings_analytics()

        return {
            "total_spend": spend["total_spend"],
            "total_orders": po["total_orders"],
            "active_vendors": active_vendors,
            "active_contracts": contract["active_contracts"],
            "budget_utilization_percentage": budget["budget_utilization_percentage"],
            "total_procurement_savings": round(
                savings["negotiated_savings"]
                + savings["budget_savings"]
                + savings["procurement_savings"], 2
            ),
            # trend hints (vs prior period) – derived from monthly trend
            "spend_trend_pct": self._period_trend_pct(spend.get("monthly_trend", [])),
            "savings_pct": savings["savings_percentage"],
        }

    def _period_trend_pct(self, monthly_trend: list) -> float:
        """Compare last month spend to the month before and return % change."""
        if len(monthly_trend) < 2:
            return 0.0
        last = monthly_trend[-1]["amount"]
        prev = monthly_trend[-2]["amount"]
        if prev == 0:
            return 0.0
        return round((last - prev) / prev * 100, 1)

    # ── Spend Analytics ───────────────────────────────────────────────────────

    def get_spend_summary(self, **filters):
        base = (
            self.db.query(PurchaseOrder)
            .join(Vendor,              PurchaseOrder.vendor_id     == Vendor.id)
            .join(Department,          PurchaseOrder.department_id == Department.id)
            .join(ProcurementCategory, PurchaseOrder.category_id   == ProcurementCategory.id)
        )
        base = self._apply_filters(base, **filters)
        orders = base.all()
        amounts = [o.amount for o in orders]
        total   = sum(amounts)
        avg     = total / len(amounts) if amounts else 0
        return {
            "success": True,
            "total_spend":     round(total, 2),
            "average_spend":   round(avg, 2),
            "max_purchase":    round(max(amounts), 2) if amounts else 0,
            "min_purchase":    round(min(amounts), 2) if amounts else 0,
            "monthly_trend":   self.get_monthly_spend(filters),
            "quarterly_trend": self.get_quarterly_spend(filters),
            "yearly_trend":    self.get_yearly_spend(filters),
        }

    def get_monthly_spend(self, filters=None):
        q = (
            self.db.query(
                func.strftime("%Y-%m", PurchaseOrder.order_date).label("month"),
                func.sum(PurchaseOrder.amount).label("amount"),
            )
            .group_by(func.strftime("%Y-%m", PurchaseOrder.order_date))
            .order_by("month")
        )
        if filters:
            q = self._apply_filters(q, **filters)
        return [{"month": r.month, "amount": round(float(r.amount), 2)} for r in q.all()]

    def get_yearly_spend(self, filters=None):
        q = (
            self.db.query(
                func.strftime("%Y", PurchaseOrder.order_date).label("year"),
                func.sum(PurchaseOrder.amount).label("amount"),
            )
            .group_by(func.strftime("%Y", PurchaseOrder.order_date))
            .order_by("year")
        )
        if filters:
            q = self._apply_filters(q, **filters)
        return [{"year": r.year, "amount": round(float(r.amount), 2)} for r in q.all()]

    def get_quarterly_spend(self, filters=None):
        q = (
            self.db.query(
                func.strftime("%Y", PurchaseOrder.order_date).label("year"),
                (
                    (func.strftime("%m", PurchaseOrder.order_date).cast(Integer) - 1) / 3 + 1
                ).label("quarter"),
                func.sum(PurchaseOrder.amount).label("amount"),
            )
            .group_by(
                func.strftime("%Y", PurchaseOrder.order_date),
                (func.strftime("%m", PurchaseOrder.order_date).cast(Integer) - 1) / 3 + 1,
            )
            .order_by("year", "quarter")
        )
        if filters:
            q = self._apply_filters(q, **filters)
        return [
            {"quarter": f"{int(r.year)} Q{int(r.quarter)}", "amount": round(float(r.amount), 2)}
            for r in q.all()
        ]

    def get_category_spend(self):
        rows = (
            self.db.query(
                ProcurementCategory.name.label("category"),
                func.sum(PurchaseOrder.amount).label("amount"),
                func.count(PurchaseOrder.id).label("purchase_count"),
                func.avg(PurchaseOrder.amount).label("average_cost"),
            )
            .join(PurchaseOrder, PurchaseOrder.category_id == ProcurementCategory.id)
            .group_by(ProcurementCategory.name)
            .all()
        )
        return [
            {
                "category":      r.category,
                "amount":        round(float(r.amount), 2),
                "purchase_count": int(r.purchase_count),
                "average_cost":  round(float(r.average_cost), 2),
            }
            for r in rows
        ]

    def get_vendor_spend(self):
        rows = (
            self.db.query(
                Vendor.name.label("vendor"),
                func.sum(PurchaseOrder.amount).label("amount"),
                func.count(PurchaseOrder.id).label("order_count"),
            )
            .join(PurchaseOrder, PurchaseOrder.vendor_id == Vendor.id)
            .group_by(Vendor.name)
            .all()
        )
        return [
            {"vendor": r.vendor, "amount": round(float(r.amount), 2), "order_count": int(r.order_count)}
            for r in rows
        ]

    # ── Purchase Order Analytics ──────────────────────────────────────────────

    def get_purchase_order_summary(self, **filters):
        base = (
            self.db.query(PurchaseOrder)
            .join(Vendor,              PurchaseOrder.vendor_id     == Vendor.id)
            .join(Department,          PurchaseOrder.department_id == Department.id)
            .join(ProcurementCategory, PurchaseOrder.category_id   == ProcurementCategory.id)
        )
        base = self._apply_filters(base, **filters)
        total     = base.count()
        pending   = base.filter(PurchaseOrder.status == "Pending").count()
        approved  = base.filter(PurchaseOrder.status == "Approved").count()
        rejected  = base.filter(PurchaseOrder.status == "Rejected").count()
        completed = base.filter(PurchaseOrder.status == "Completed").count()
        cancelled = base.filter(PurchaseOrder.status == "Cancelled").count()
        avg_val   = base.with_entities(func.avg(PurchaseOrder.amount)).scalar() or 0
        return {
            "total_orders":       total,
            "pending_orders":     pending,
            "approved_orders":    approved,
            "rejected_orders":    rejected,
            "completed_orders":   completed,
            "cancelled_orders":   cancelled,
            "average_order_value": round(float(avg_val), 2),
        }

    # ── Vendor Analytics ──────────────────────────────────────────────────────

    def get_vendor_analytics(self):
        vendors = self.db.query(Vendor).all()
        result = []
        for idx, vendor in enumerate(vendors):
            spend = float(
                self.db.query(func.sum(PurchaseOrder.amount))
                .filter(PurchaseOrder.vendor_id == vendor.id)
                .scalar() or 0
            )
            orders = self.db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor.id).count()
            result.append({
                "vendor":           vendor.name,
                "rank":             idx + 1,
                "spend":            round(spend, 2),
                "total_orders":     orders,
                "performance":      round(vendor.reliability_score * 100, 2),
                "avg_delivery_time": round(vendor.avg_delivery_time, 2),
                "reliability_score": round(vendor.reliability_score, 2),
            })
        # Sort by spend descending and re-rank
        result.sort(key=lambda x: x["spend"], reverse=True)
        for i, item in enumerate(result):
            item["rank"] = i + 1
        return result

    # ── Category Analytics ────────────────────────────────────────────────────

    def get_category_analytics(self):
        rows = (
            self.db.query(
                ProcurementCategory,
                func.sum(PurchaseOrder.amount).label("amount"),
                func.count(PurchaseOrder.id).label("count"),
                func.avg(PurchaseOrder.amount).label("avg_cost"),
            )
            .join(PurchaseOrder, PurchaseOrder.category_id == ProcurementCategory.id)
            .group_by(ProcurementCategory.id)
            .all()
        )
        return [
            {
                "category":      cat.name,
                "spend":         round(float(amount), 2),
                "purchase_count": int(count),
                "average_cost":  round(float(avg_cost), 2),
            }
            for cat, amount, count, avg_cost in rows
        ]

    # ── Contract Analytics ────────────────────────────────────────────────────

    def get_contract_analytics(self):
        today         = date.today()
        active        = self.db.query(Contract).filter(Contract.status == "Active").count()
        expired       = self.db.query(Contract).filter(Contract.end_date < today).count()
        expiring_soon = (
            self.db.query(Contract)
            .filter(Contract.end_date >= today, Contract.end_date <= today + timedelta(days=90))
            .count()
        )
        contract_value = float(self.db.query(func.sum(Contract.value)).scalar() or 0)
        avg_duration   = float(
            self.db.query(
                func.avg(func.julianday(Contract.end_date) - func.julianday(Contract.start_date))
            ).scalar() or 0
        )
        return {
            "active_contracts":        active,
            "expired_contracts":       expired,
            "contracts_expiring_soon": expiring_soon,
            "contract_value":          round(contract_value, 2),
            "average_contract_duration": round(avg_duration, 2),
        }

    # ── Budget Analytics ──────────────────────────────────────────────────────

    def get_budget_analytics(self):
        row = self.db.query(
            func.sum(Budget.allocated_amount).label("allocated"),
            func.sum(Budget.utilized_amount).label("utilized"),
        ).first()
        allocated = float(row.allocated or 0)
        utilized  = float(row.utilized  or 0)
        remaining = allocated - utilized
        pct       = (utilized / allocated * 100) if allocated else 0

        # Per-department breakdown
        dept_rows = (
            self.db.query(
                Department.name.label("department"),
                func.sum(Budget.allocated_amount).label("allocated"),
                func.sum(Budget.utilized_amount).label("utilized"),
            )
            .join(Department, Budget.department_id == Department.id)
            .group_by(Department.name)
            .all()
        )
        dept_breakdown = [
            {
                "department": r.department,
                "allocated":  round(float(r.allocated), 2),
                "utilized":   round(float(r.utilized), 2),
                "utilization_pct": round(float(r.utilized) / float(r.allocated) * 100, 1) if r.allocated else 0,
            }
            for r in dept_rows
        ]

        return {
            "budget_allocated":            round(allocated, 2),
            "budget_utilized":             round(utilized, 2),
            "remaining_budget":            round(remaining, 2),
            "budget_utilization_percentage": round(pct, 2),
            "department_breakdown":        dept_breakdown,
        }

    # ── Cost Savings Analytics ────────────────────────────────────────────────

    def get_cost_savings_analytics(self):
        rows = self.db.query(CostSaving).order_by(CostSaving.month).all()
        if not rows:
            return {
                "negotiated_savings":    0,
                "budget_savings":        0,
                "procurement_savings":   0,
                "savings_percentage":    0,
                "monthly_savings_trend": [],
            }
        total_neg   = sum(r.negotiated_savings   for r in rows)
        total_bud   = sum(r.budget_savings        for r in rows)
        total_proc  = sum(r.procurement_savings   for r in rows)
        avg_pct     = sum(r.savings_percentage    for r in rows) / len(rows)
        return {
            "negotiated_savings":    round(total_neg,  2),
            "budget_savings":        round(total_bud,  2),
            "procurement_savings":   round(total_proc, 2),
            "savings_percentage":    round(avg_pct,    2),
            "monthly_savings_trend": [
                {"month": r.month, "savings": round(r.procurement_savings, 2)}
                for r in rows
            ],
        }
