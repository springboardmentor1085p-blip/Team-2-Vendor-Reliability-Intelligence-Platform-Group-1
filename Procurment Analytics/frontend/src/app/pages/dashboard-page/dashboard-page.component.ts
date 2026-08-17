import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

// ApexCharts
import { NgApexchartsModule } from 'ng-apexcharts';

// Services & Models
import { AnalyticsService } from '../../services/analytics.service';
import {
  BudgetAnalytics, CategoryAnalyticsItem, ContractAnalytics,
  CostSavingsAnalytics, FilterOptions, KpiOverview,
  PurchaseOrderSummary, SpendSummary, VendorAnalyticsItem
} from '../../models/analytics.models';

// Reusable components
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { SpendTrendChartComponent } from '../../components/charts/spend-trend-chart/spend-trend-chart.component';
import { CategoryBarChartComponent } from '../../components/charts/category-bar-chart/category-bar-chart.component';
import { VendorPieChartComponent } from '../../components/charts/vendor-pie-chart/vendor-pie-chart.component';
import { QuarterlyAreaChartComponent } from '../../components/charts/quarterly-area-chart/quarterly-area-chart.component';
import { SavingsBarChartComponent } from '../../components/charts/savings-bar-chart/savings-bar-chart.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatProgressBarModule, MatChipsModule,
    MatDividerModule, MatTooltipModule, MatBadgeModule,
    NgApexchartsModule,
    KpiCardComponent,
    SpendTrendChartComponent, CategoryBarChartComponent,
    VendorPieChartComponent, QuarterlyAreaChartComponent, SavingsBarChartComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {

  // ── State signals ──────────────────────────────────────────────────────
  loading    = signal(true);
  hasError   = signal(false);
  darkTheme  = signal(false);

  // ── Data ───────────────────────────────────────────────────────────────
  kpi!: KpiOverview;
  spendSummary!: SpendSummary;
  purchaseOrders!: PurchaseOrderSummary;
  vendors:    VendorAnalyticsItem[]  = [];
  categories: CategoryAnalyticsItem[] = [];
  contracts!: ContractAnalytics;
  budget!:    BudgetAnalytics;
  savings!:   CostSavingsAnalytics;
  filterOptions: FilterOptions = { vendors: [], categories: [], departments: [], financial_years: [], statuses: [] };

  // ── Filter state ────────────────────────────────────────────────────────
  selectedVendor     = '';
  selectedCategory   = '';
  selectedDepartment = '';
  selectedStatus     = '';
  selectedYear       = '';

  // ── Active section tab ──────────────────────────────────────────────────
  activeSection: 'overview' | 'vendors' | 'contracts' | 'budget' | 'savings' = 'overview';

  constructor(private svc: AnalyticsService) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadAll();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private get filters() {
    return {
      vendor:         this.selectedVendor     || undefined,
      category:       this.selectedCategory   || undefined,
      department:     this.selectedDepartment || undefined,
      status:         this.selectedStatus     || undefined,
      financial_year: this.selectedYear       || undefined,
    };
  }

  loadFilterOptions(): void {
    this.svc.getFilterOptions().subscribe({
      next: opts => this.filterOptions = opts,
      error: () => {}   // non-critical – fall back to empty dropdowns
    });
  }

  loadAll(): void {
    this.loading.set(true);
    this.hasError.set(false);

    forkJoin({
      kpi:      this.svc.getKpiOverview(this.filters),
      spend:    this.svc.getSpendSummary(this.filters),
      orders:   this.svc.getPurchaseOrders(this.filters),
      vendors:  this.svc.getVendorAnalytics(),
      cats:     this.svc.getCategoryAnalytics(),
      contracts: this.svc.getContractAnalytics(),
      budget:   this.svc.getBudgetAnalytics(),
      savings:  this.svc.getCostSavingsAnalytics(),
    }).subscribe({
      next: data => {
        this.kpi           = data.kpi;
        this.spendSummary  = data.spend;
        this.purchaseOrders = data.orders;
        this.vendors       = data.vendors;
        this.categories    = data.cats;
        this.contracts     = data.contracts;
        this.budget        = data.budget;
        this.savings       = data.savings;
        this.loading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void { this.loadAll(); }

  resetFilters(): void {
    this.selectedVendor = this.selectedCategory = this.selectedDepartment =
      this.selectedStatus = this.selectedYear = '';
    this.loadAll();
  }

  // ── Theme ──────────────────────────────────────────────────────────────

  toggleTheme(): void {
    this.darkTheme.update(v => !v);
    document.body.classList.toggle('dark-theme', this.darkTheme());
  }

  // ── Status chip colour ─────────────────────────────────────────────────

  statusColor(s: string): string {
    const map: Record<string, string> = {
      Pending: 'warn', Approved: 'accent', Completed: 'primary',
      Rejected: 'warn', Cancelled: ''
    };
    return map[s] ?? '';
  }

  // ── Budget utilisation bar colour ──────────────────────────────────────

  budgetBarColor(pct: number): string {
    if (pct >= 90) return 'warn';
    if (pct >= 70) return 'accent';
    return 'primary';
  }

  // ── Export helpers ─────────────────────────────────────────────────────

  exportCsv(): void {
    const rows: (string | number)[][] = [
      ['=== KPI SUMMARY ==='],
      ['Metric', 'Value'],
      ['Total Spend ($)',         this.kpi?.total_spend ?? 0],
      ['Purchase Orders',         this.kpi?.total_orders ?? 0],
      ['Active Vendors',          this.kpi?.active_vendors ?? 0],
      ['Active Contracts',        this.kpi?.active_contracts ?? 0],
      ['Budget Utilization (%)',   this.kpi?.budget_utilization_percentage ?? 0],
      ['Total Savings ($)',        this.kpi?.total_procurement_savings ?? 0],
      [],
      ['=== VENDOR ANALYTICS ==='],
      ['Rank', 'Vendor', 'Spend ($)', 'Orders', 'Reliability Score', 'Avg Delivery (days)'],
      ...this.vendors.map(v => [v.rank, v.vendor, v.spend, v.total_orders, v.reliability_score, v.avg_delivery_time]),
      [],
      ['=== CATEGORY ANALYTICS ==='],
      ['Category', 'Spend ($)', 'Purchase Count', 'Avg Cost ($)'],
      ...this.categories.map(c => [c.category, c.spend, c.purchase_count, c.average_cost]),
      [],
      ['=== MONTHLY SPEND TREND ==='],
      ['Month', 'Amount ($)'],
      ...(this.spendSummary?.monthly_trend ?? []).map(t => [t.month, t.amount]),
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    this._download(csv, 'procurement-analytics.csv', 'text/csv;charset=utf-8;');
  }

  exportExcel(): void {
    // Simple TSV that Excel opens natively
    const headers = ['Rank', 'Vendor', 'Spend', 'Orders', 'Reliability', 'Delivery Days'];
    const rows    = this.vendors.map(v =>
      [v.rank, v.vendor, v.spend, v.total_orders, v.reliability_score, v.avg_delivery_time].join('\t')
    );
    const tsv = [headers.join('\t'), ...rows].join('\n');
    this._download(tsv, 'vendor-analytics.xls', 'application/vnd.ms-excel');
  }

  printDashboard(): void { window.print(); }

  private _download(content: string, filename: string, mime: string): void {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;  a.download = filename;  a.click();
    URL.revokeObjectURL(url);
  }

  // ── Contract progress helpers ───────────────────────────────────────────
  contractActivePct(): number {
    if (!this.contracts) return 0;
    const total = (this.contracts.active_contracts || 0) + (this.contracts.expired_contracts || 0);
    return total ? (this.contracts.active_contracts / total) * 100 : 0;
  }

  contractExpiredPct(): number {
    if (!this.contracts) return 0;
    const total = (this.contracts.active_contracts || 0) + (this.contracts.expired_contracts || 0);
    return total ? (this.contracts.expired_contracts / total) * 100 : 0;
  }

  // ── Chart helpers ──────────────────────────────────────────────────────

  get vendorPieData() {
    return this.vendors.map(v => ({ vendor: v.vendor, amount: v.spend }));
  }

  get categoryBarData() {
    return this.categories.map(c => ({ category: c.category, amount: c.spend, purchase_count: c.purchase_count }));
  }
}
