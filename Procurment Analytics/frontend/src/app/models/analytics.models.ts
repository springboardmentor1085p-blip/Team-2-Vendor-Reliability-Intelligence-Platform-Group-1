export interface SpendSummary {
  total_spend: number;
  average_spend: number;
  max_purchase: number;
  min_purchase: number;
  monthly_trend: Array<{ month: string; amount: number }>;
  quarterly_trend: Array<{ quarter: string; amount: number }>;
  yearly_trend: Array<{ year: string; amount: number }>;
}

export interface PurchaseOrderSummary {
  total_orders: number;
  pending_orders: number;
  approved_orders: number;
  rejected_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  average_order_value: number;
}

export interface VendorAnalyticsItem {
  vendor: string;
  rank: number;
  spend: number;
  total_orders: number;
  performance: number;
  avg_delivery_time: number;
  reliability_score: number;
}

export interface CategoryAnalyticsItem {
  category: string;
  spend: number;
  purchase_count: number;
  average_cost: number;
}

export interface ContractAnalytics {
  active_contracts: number;
  expired_contracts: number;
  contracts_expiring_soon: number;
  contract_value: number;
  average_contract_duration: number;
}

export interface BudgetDeptBreakdown {
  department: string;
  allocated: number;
  utilized: number;
  utilization_pct: number;
}

export interface BudgetAnalytics {
  budget_allocated: number;
  budget_utilized: number;
  remaining_budget: number;
  budget_utilization_percentage: number;
  department_breakdown?: BudgetDeptBreakdown[];
}

export interface CostSavingsAnalytics {
  negotiated_savings: number;
  budget_savings: number;
  procurement_savings: number;
  savings_percentage: number;
  monthly_savings_trend: Array<{ month: string; savings: number }>;
}

export interface FilterOptions {
  vendors: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
  departments: Array<{ id: number; name: string }>;
  financial_years: string[];
  statuses: string[];
}

export interface KpiOverview {
  total_spend: number;
  total_orders: number;
  active_vendors: number;
  active_contracts: number;
  budget_utilization_percentage: number;
  total_procurement_savings: number;
  spend_trend_pct: number;
  savings_pct: number;
}
