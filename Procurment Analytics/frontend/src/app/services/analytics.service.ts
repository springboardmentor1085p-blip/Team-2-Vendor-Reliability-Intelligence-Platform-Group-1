import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BudgetAnalytics, CategoryAnalyticsItem, ContractAnalytics,
  CostSavingsAnalytics, FilterOptions, KpiOverview,
  PurchaseOrderSummary, SpendSummary, VendorAnalyticsItem
} from '../models/analytics.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly base = 'http://127.0.0.1:8000/analytics';

  constructor(private http: HttpClient) {}

  // ── helpers ──────────────────────────────────────────────────────────────

  private buildParams(filters: Record<string, string | null | undefined>): HttpParams {
    let p = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p = p.set(k, v); });
    return p;
  }

  // ── filter options ───────────────────────────────────────────────────────

  getFilterOptions(): Observable<FilterOptions> {
    return this.http.get<FilterOptions>(`${this.base}/filters`);
  }

  // ── kpi overview ─────────────────────────────────────────────────────────

  getKpiOverview(filters: Record<string, string | null | undefined> = {}): Observable<KpiOverview> {
    return this.http.get<KpiOverview>(`${this.base}/kpi-overview`, { params: this.buildParams(filters) });
  }

  // ── spend ────────────────────────────────────────────────────────────────

  getSpendSummary(filters: Record<string, string | null | undefined> = {}): Observable<SpendSummary> {
    return this.http.get<SpendSummary>(`${this.base}/spend/summary`, { params: this.buildParams(filters) });
  }

  getMonthlySpend(): Observable<Array<{ month: string; amount: number }>> {
    return this.http.get<Array<{ month: string; amount: number }>>(`${this.base}/spend/monthly`);
  }

  getYearlySpend(): Observable<Array<{ year: string; amount: number }>> {
    return this.http.get<Array<{ year: string; amount: number }>>(`${this.base}/spend/yearly`);
  }

  getCategorySpend(): Observable<Array<{ category: string; amount: number; purchase_count: number; average_cost: number }>> {
    return this.http.get<any[]>(`${this.base}/spend/category`);
  }

  getVendorSpend(): Observable<Array<{ vendor: string; amount: number; order_count: number }>> {
    return this.http.get<any[]>(`${this.base}/spend/vendor`);
  }

  // ── purchase orders ──────────────────────────────────────────────────────

  getPurchaseOrders(filters: Record<string, string | null | undefined> = {}): Observable<PurchaseOrderSummary> {
    return this.http.get<PurchaseOrderSummary>(`${this.base}/purchase-orders`, { params: this.buildParams(filters) });
  }

  // ── vendors / categories ─────────────────────────────────────────────────

  getVendorAnalytics(): Observable<VendorAnalyticsItem[]> {
    return this.http.get<VendorAnalyticsItem[]>(`${this.base}/vendor-analytics`);
  }

  getCategoryAnalytics(): Observable<CategoryAnalyticsItem[]> {
    return this.http.get<CategoryAnalyticsItem[]>(`${this.base}/category-analytics`);
  }

  // ── contracts / budget / savings ─────────────────────────────────────────

  getContractAnalytics(): Observable<ContractAnalytics> {
    return this.http.get<ContractAnalytics>(`${this.base}/contract-analytics`);
  }

  getBudgetAnalytics(): Observable<BudgetAnalytics> {
    return this.http.get<BudgetAnalytics>(`${this.base}/budget-analytics`);
  }

  getCostSavingsAnalytics(): Observable<CostSavingsAnalytics> {
    return this.http.get<CostSavingsAnalytics>(`${this.base}/cost-savings`);
  }
}
