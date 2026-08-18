from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder
from app.models.contract import Contract
from app.models.communication import Communication
from app.models.risk import Risk
from app.models.vendor_performance import VendorPerformance

from app.schemas.dashboard import DashboardSummary


def get_dashboard_summary(db: Session) -> DashboardSummary:
    total_vendors = (
        db.query(func.count(Vendor.id)).scalar() or 0
    )

    active_vendors = (
        db.query(func.count(Vendor.id))
        .filter(Vendor.is_active == True)
        .scalar()
        or 0
    )

    total_purchase_orders = (
        db.query(func.count(PurchaseOrder.id)).scalar() or 0
    )

    active_contracts = (
        db.query(func.count(Contract.id))
        .filter(Contract.status == "Active")
        .scalar()
        or 0
    )

    high_risk_vendors = (
        db.query(func.count(func.distinct(Risk.vendor_id)))
        .filter(
            Risk.severity.in_(["HIGH", "High", "high"])
        )
        .scalar()
        or 0
    )

    total_contract_value = (
        db.query(func.coalesce(func.sum(Contract.contract_value), 0))
        .scalar()
        or 0
    )

    total_procurement_value = (
        db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0))
        .scalar()
        or 0
    )

    total_communications = (
        db.query(func.count(Communication.id)).scalar() or 0
    )

    performance_records = (
        db.query(VendorPerformance).all()
    )

    if performance_records:
        average_performance = round(
            sum(
                float(p.performance_score or 0)
                for p in performance_records
            ) / len(performance_records),
            2,
        )
    else:
        average_performance = 0.0

    return DashboardSummary(
        total_vendors=total_vendors,
        active_vendors=active_vendors,
        total_purchase_orders=total_purchase_orders,
        active_contracts=active_contracts,
        high_risk_vendors=high_risk_vendors,
        total_contract_value=float(total_contract_value),
        total_procurement_value=float(total_procurement_value),
        total_communications=total_communications,
        average_performance=average_performance,
    )
