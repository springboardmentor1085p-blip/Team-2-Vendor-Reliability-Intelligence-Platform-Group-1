import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ExecutiveDashboard, KPISummary, CategoryBreakdown,
  StatusBreakdown, TopVendor, RecentPurchaseOrder,
  DeliveryTrend, CostAnalysis, RiskDistribution, TrendPoint,
  DashboardFilters, VendorDrillDown, CategoryDrillDown,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  private buildParams(filters?: DashboardFilters): HttpParams {
    let p = new HttpParams();
    if (!filters) return p;
    if (filters.date_from)       p = p.set('date_from', filters.date_from);
    if (filters.date_to)         p = p.set('date_to', filters.date_to);
    if (filters.vendor_category) p = p.set('vendor_category', filters.vendor_category);
    if (filters.top_n)           p = p.set('top_n', filters.top_n.toString());
    return p;
  }

  getExecutiveDashboard(filters?: DashboardFilters): Observable<ExecutiveDashboard> {
    return this.http.get<ExecutiveDashboard>(`${this.base}/executive`, {
      params: this.buildParams(filters),
    });
  }

  getKpiSummary(filters?: DashboardFilters): Observable<KPISummary> {
    return this.http.get<KPISummary>(`${this.base}/kpi`, {
      params: this.buildParams(filters),
    });
  }

  getVendorCategories(): Observable<CategoryBreakdown[]> {
    return this.http.get<CategoryBreakdown[]>(`${this.base}/vendor-categories`);
  }

  getProcurementStatus(): Observable<StatusBreakdown[]> {
    return this.http.get<StatusBreakdown[]>(`${this.base}/procurement-status`);
  }

  getTopVendors(topN = 10, category?: string): Observable<TopVendor[]> {
    let p = new HttpParams().set('top_n', topN.toString());
    if (category) p = p.set('vendor_category', category);
    return this.http.get<TopVendor[]>(`${this.base}/top-vendors`, { params: p });
  }

  getRecentOrders(limit = 10, vendorId?: number): Observable<RecentPurchaseOrder[]> {
    let p = new HttpParams().set('limit', limit.toString());
    if (vendorId) p = p.set('vendor_id', vendorId.toString());
    return this.http.get<RecentPurchaseOrder[]>(`${this.base}/recent-orders`, { params: p });
  }

  getDeliveryTrends(months = 12): Observable<DeliveryTrend[]> {
    return this.http.get<DeliveryTrend[]>(`${this.base}/delivery-trends`, {
      params: new HttpParams().set('months', months.toString()),
    });
  }

  getCostAnalysis(months = 12): Observable<CostAnalysis[]> {
    return this.http.get<CostAnalysis[]>(`${this.base}/cost-analysis`, {
      params: new HttpParams().set('months', months.toString()),
    });
  }

  getRiskDistribution(): Observable<RiskDistribution[]> {
    return this.http.get<RiskDistribution[]>(`${this.base}/risk-distribution`);
  }

  getMonthlyPoTrend(months = 12): Observable<TrendPoint[]> {
    return this.http.get<TrendPoint[]>(`${this.base}/monthly-po-trend`, {
      params: new HttpParams().set('months', months.toString()),
    });
  }

  getReliabilityTrend(months = 12): Observable<TrendPoint[]> {
    return this.http.get<TrendPoint[]>(`${this.base}/reliability-trend`, {
      params: new HttpParams().set('months', months.toString()),
    });
  }

  // ── Drill-down ────────────────────────────────────────────────────────────

  getVendorDrillDown(vendorId: number): Observable<VendorDrillDown> {
    return this.http.get<VendorDrillDown>(`${this.base}/drill/vendor/${vendorId}`);
  }

  getCategoryDrillDown(category: string): Observable<CategoryDrillDown> {
    return this.http.get<CategoryDrillDown>(`${this.base}/drill/category/${category}`);
  }
}
