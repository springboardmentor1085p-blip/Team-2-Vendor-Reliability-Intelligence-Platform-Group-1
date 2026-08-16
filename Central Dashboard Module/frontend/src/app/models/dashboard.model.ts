export interface KPISummary {
  total_vendors: number;
  active_vendors: number;
  pending_vendors: number;
  total_purchase_orders: number;
  active_purchase_orders: number;
  total_procurement_value: number;
  avg_vendor_reliability_score: number;
  on_time_delivery_rate: number;
  contract_compliance_rate: number;
  expiring_contracts_count: number;
  overdue_orders_count: number;
  total_contracts: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  total_value: number;
}

export interface TopVendor {
  vendor_id: number;
  vendor_name: string;
  category: string;
  reliability_score: number;
  on_time_delivery_rate: number;
  total_orders: number;
  total_value: number;
}

export interface RecentPurchaseOrder {
  id: number;
  po_number: string;
  vendor_name: string;
  status: string;
  total_amount: number;
  order_date: string | null;
  expected_delivery: string | null;
}

export interface DeliveryTrend {
  month: string;
  on_time: number;
  delayed: number;
  on_time_rate: number;
}

export interface CostAnalysis {
  month: string;
  total_spend: number;
  approved_spend: number;
  pending_spend: number;
}

export interface RiskDistribution {
  risk_level: string;
  count: number;
  percentage: number;
}

export interface ExecutiveDashboard {
  kpi_summary: KPISummary;
  vendor_categories: CategoryBreakdown[];
  procurement_status: StatusBreakdown[];
  top_vendors: TopVendor[];
  recent_purchase_orders: RecentPurchaseOrder[];
  delivery_trends: DeliveryTrend[];
  cost_analysis: CostAnalysis[];
  risk_distribution: RiskDistribution[];
  monthly_po_trend: TrendPoint[];
  reliability_trend: TrendPoint[];
}

export interface DashboardFilters {
  date_from?: string;
  date_to?: string;
  vendor_category?: string;
  top_n?: number;
}

// ── Drill-down models ─────────────────────────────────────────────────────────

export interface VendorDrillDown {
  vendor_id: number;
  vendor_name: string;
  category: string;
  status: string;
  reliability_score: number;
  total_orders: number;
  total_spend: number;
  on_time_rate: number;
  total_deliveries: number;
  avg_quality: number;
  monthly_orders: TrendPoint[];
  recent_orders: RecentPurchaseOrder[];
}

export interface CategoryDrillDown {
  category: string;
  vendor_count: number;
  avg_reliability: number;
  total_spend: number;
  total_orders: number;
  on_time_rate: number;
  vendors: TopVendor[];
  monthly_spend: TrendPoint[];
}
