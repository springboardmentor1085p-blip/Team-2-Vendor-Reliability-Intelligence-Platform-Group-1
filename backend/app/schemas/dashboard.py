from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_vendors: int
    active_vendors: int
    total_purchase_orders: int
    active_contracts: int
    high_risk_vendors: int
    total_contract_value: float
    total_procurement_value: float
    total_communications: int
    average_performance: float
