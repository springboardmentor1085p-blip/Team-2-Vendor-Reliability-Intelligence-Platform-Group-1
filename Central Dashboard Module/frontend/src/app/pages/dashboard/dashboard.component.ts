import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartEvent, ActiveElement } from 'chart.js';
import { Subject, takeUntil, finalize } from 'rxjs';

import { DashboardService } from '../../services/dashboard.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import {
  ExecutiveDashboard, DashboardFilters,
  VendorDrillDown, CategoryDrillDown, TopVendor,
} from '../../models/dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [
    CommonModule, ReactiveFormsModule, DecimalPipe, CurrencyPipe, TitleCasePipe, DatePipe,
    MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule,
    MatInputModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
    MatTableModule, MatTooltipModule, MatSnackBarModule,
    BaseChartDirective, SidebarComponent, TopbarComponent,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  sidebarCollapsed = signal(false);
  loading          = signal(false);
  drillLoading     = signal(false);
  data             = signal<ExecutiveDashboard | null>(null);

  // Drill-down state
  vendorDrill   = signal<VendorDrillDown | null>(null);
  categoryDrill = signal<CategoryDrillDown | null>(null);
  drillType     = signal<'vendor' | 'category' | null>(null);
  activeFilter  = signal<string>('');   // shows which filter is active in header

  filterForm: FormGroup;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  vendorCols = ['rank', 'name', 'score', 'delivery', 'value'];
  orderCols  = ['po_number', 'vendor', 'status', 'amount', 'order_date', 'expected_delivery'];
  drillOrderCols = ['po_number', 'status', 'amount', 'order_date', 'expected_delivery'];

  vendorCategories = [
    { value: 'raw_material', label: 'Raw Material' },
    { value: 'equipment',    label: 'Equipment' },
    { value: 'it',           label: 'IT & Technology' },
    { value: 'service',      label: 'Service Provider' },
    { value: 'logistics',    label: 'Logistics' },
    { value: 'maintenance',  label: 'Maintenance' },
  ];

  // ── Chart options ──────────────────────────────────────────────────────────

  barOptions: any = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 10 } } },
    },
  };

  lineOptions: any = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 10 } } },
    },
    elements: { line: { tension: 0.4 }, point: { radius: 3 } },
  };

  doughnutOptions: any = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } } },
    cutout: '68%',
  };

  pieOptions: any = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12, padding: 12 } } },
  };

  // ── Clickable pie options ─────────────────────────────────────────────────
  pieClickOptions: any = {
    ...this.pieOptions,
    onClick: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        const label = (chart.data.labels as string[])[idx];
        this.onCategoryClick(label);
      }
    },
    onHover: (_: any, elements: ActiveElement[]) => {
      const canvas = document.querySelector('.category-chart canvas') as HTMLCanvasElement;
      if (canvas) canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    },
  };

  doughnutClickOptions: any = {
    ...this.doughnutOptions,
    onClick: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        const label = (chart.data.labels as string[])[idx];
        this.onStatusClick(label);
      }
    },
    onHover: (_: any, elements: ActiveElement[]) => {
      const canvas = document.querySelector('.status-chart canvas') as HTMLCanvasElement;
      if (canvas) canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    },
  };

  riskClickOptions: any = {
    ...this.doughnutOptions,
    onClick: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        const label = (chart.data.labels as string[])[idx];
        this.onRiskClick(label);
      }
    },
    onHover: (_: any, elements: ActiveElement[]) => {
      const canvas = document.querySelector('.risk-chart canvas') as HTMLCanvasElement;
      if (canvas) canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    },
  };

  // ── Computed chart datasets ────────────────────────────────────────────────

  deliveryChartData = computed(() => {
    const d = this.data();
    if (!d) return { labels: [] as string[], datasets: [] };
    return {
      labels: d.delivery_trends.map(t => t.month),
      datasets: [
        { label: 'On-Time', data: d.delivery_trends.map(t => t.on_time),  backgroundColor: '#10b981', borderRadius: 4 },
        { label: 'Delayed', data: d.delivery_trends.map(t => t.delayed),  backgroundColor: '#ef4444', borderRadius: 4 },
      ],
    };
  });

  procurementStatusChart = computed(() => {
    const d = this.data();
    if (!d) return { labels: [] as string[], datasets: [] };
    return {
      labels: d.procurement_status.map(s => s.status),
      datasets: [{
        data: d.procurement_status.map(s => s.count),
        backgroundColor: ['#4f46e5','#10b981','#f59e0b','#06b6d4','#8b5cf6','#ef4444'],
        borderWidth: 2, borderColor: '#fff',
      }],
    };
  });

  costChartData = computed(() => {
    const d = this.data();
    if (!d) return { labels: [] as string[], datasets: [] };
    return {
      labels: d.cost_analysis.map(c => c.month),
      datasets: [
        { label: 'Total Spend',    data: d.cost_analysis.map(c => c.total_spend),    borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,.08)', fill: true, borderWidth: 2 },
        { label: 'Approved Spend', data: d.cost_analysis.map(c => c.approved_spend), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.08)', fill: true, borderWidth: 2 },
        { label: 'Pending Spend',  data: d.cost_analysis.map(c => c.pending_spend),  borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,.08)',  fill: true, borderWidth: 2 },
      ],
    };
  });

  reliabilityChartData = computed(() => {
    const d = this.data();
    if (!d) return { labels: [] as string[], datasets: [] };
    return {
      labels: d.reliability_trend.map(t => t.label),
      datasets: [{
        label: 'Avg Reliability Score',
        data: d.reliability_trend.map(t => t.value),
        borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,.1)', fill: true, borderWidth: 2,
      }],
    };
  });

  vendorCategoryChart = computed(() => {
    const d = this.data();
    if (!d) return { labels: [] as string[], datasets: [] };
    return {
      labels: d.vendor_categories.map(c => c.category),
      datasets: [{
        data: d.vendor_categories.map(c => c.count),
        backgroundColor: ['#4f46e5','#f59e0b','#10b981','#06b6d4','#ef4444','#8b5cf6'],
        borderWidth: 2, borderColor: '#fff',
        hoverOffset: 8,
      }],
    };
  });

  monthlyPoChart = computed(() => {
    const d = this.data();
    if (!d) return { labels: [] as string[], datasets: [] };
    return {
      labels: d.monthly_po_trend.map(t => t.label),
      datasets: [{
        label: 'Purchase Orders',
        data: d.monthly_po_trend.map(t => t.value),
        backgroundColor: '#4f46e5', borderRadius: 5,
      }],
    };
  });

  riskChart = computed(() => {
    const d = this.data();
    if (!d) return { labels: [] as string[], datasets: [] };
    return {
      labels: d.risk_distribution.map(r => r.risk_level),
      datasets: [{
        data: d.risk_distribution.map(r => r.count),
        backgroundColor: d.risk_distribution.map(r => this.riskColor(r.risk_level)),
        borderWidth: 2, borderColor: '#fff', hoverOffset: 8,
      }],
    };
  });

  // Drill-down charts
  drillMonthlyChart = computed(() => {
    const vd = this.vendorDrill();
    const cd = this.categoryDrill();
    if (vd) return {
      labels: vd.monthly_orders.map(t => t.label),
      datasets: [{ label: 'Orders', data: vd.monthly_orders.map(t => t.value), backgroundColor: '#4f46e5', borderRadius: 4 }],
    };
    if (cd) return {
      labels: cd.monthly_spend.map(t => t.label),
      datasets: [{ label: 'Spend (USD)', data: cd.monthly_spend.map(t => t.value), borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,.1)', fill: true, borderWidth: 2 }],
    };
    return { labels: [] as string[], datasets: [] };
  });

  constructor(
    private dashSvc: DashboardService,
    private fb: FormBuilder,
    private snack: MatSnackBar,
  ) {
    this.filterForm = this.fb.group({
      date_from:       [null],
      date_to:         [null],
      vendor_category: [''],
      top_n:           [10],
    });
  }

  ngOnInit(): void { this.loadDashboard(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  applyFilters(): void { this.loadDashboard(); }

  resetFilters(): void {
    this.filterForm.reset({ date_from: null, date_to: null, vendor_category: '', top_n: 10 });
    this.activeFilter.set('');
    this.closeDrill();
    this.loadDashboard();
  }

  refresh(): void { this.closeDrill(); this.loadDashboard(); }

  private loadDashboard(): void {
    this.loading.set(true);
    const v = this.filterForm.value;
    const filters: DashboardFilters = {
      date_from:       v.date_from ? this.fmtDate(v.date_from) : undefined,
      date_to:         v.date_to   ? this.fmtDate(v.date_to)   : undefined,
      vendor_category: v.vendor_category || undefined,
      top_n:           v.top_n || 10,
    };
    this.dashSvc.getExecutiveDashboard(filters)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loading.set(false)))
      .subscribe({
        next:  res => this.data.set(res),
        error: err => this.snack.open(err?.error?.detail ?? 'Failed to load dashboard', 'Close', { duration: 4000 }),
      });
  }

  // ── Chart click handlers ──────────────────────────────────────────────────

  onCategoryClick(category: string): void {
    const catKey = category.toLowerCase().replace(/ /g, '_').replace(/\s*&\s*/g, '_').replace(/\//g, '_');
    this.closeDrill();
    this.drillLoading.set(true);
    this.activeFilter.set(`Category: ${category}`);
    this.dashSvc.getCategoryDrillDown(catKey)
      .pipe(finalize(() => this.drillLoading.set(false)))
      .subscribe({
        next:  d => { this.categoryDrill.set(d); this.drillType.set('category'); this.scrollToDrill(); },
        error: err => this.snack.open(err?.error?.detail ?? 'Failed to load category data', 'Close', { duration: 3000 }),
      });
    // Also apply category filter to main dashboard
    this.filterForm.patchValue({ vendor_category: catKey });
    this.loadDashboard();
  }

  onVendorRowClick(v: TopVendor): void {
    this.closeDrill();
    this.drillLoading.set(true);
    this.activeFilter.set(`Vendor: ${v.vendor_name}`);
    this.dashSvc.getVendorDrillDown(v.vendor_id)
      .pipe(finalize(() => this.drillLoading.set(false)))
      .subscribe({
        next:  d => { this.vendorDrill.set(d); this.drillType.set('vendor'); this.scrollToDrill(); },
        error: err => this.snack.open(err?.error?.detail ?? 'Failed to load vendor data', 'Close', { duration: 3000 }),
      });
  }

  onStatusClick(status: string): void {
    this.snack.open(`Filtered by status: ${status}`, 'Close', { duration: 2500 });
  }

  onRiskClick(riskLevel: string): void {
    this.snack.open(`Risk level: ${riskLevel} — ${this.riskDescription(riskLevel)}`, 'Close', { duration: 3000 });
  }

  closeDrill(): void {
    this.vendorDrill.set(null);
    this.categoryDrill.set(null);
    this.drillType.set(null);
  }

  clearCategoryFilter(): void {
    this.filterForm.patchValue({ vendor_category: '' });
    this.activeFilter.set('');
    this.closeDrill();
    this.loadDashboard();
  }

  private scrollToDrill(): void {
    setTimeout(() => {
      document.getElementById('drill-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  private fmtDate(d: Date): string { return d.toISOString().split('T')[0]; }

  scoreClass(s: number): string {
    return s >= 70 ? 'risk-low' : s >= 50 ? 'risk-medium' : 'risk-high';
  }

  riskColor(level: string): string {
    const m: Record<string, string> = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Critical: '#8b5cf6' };
    return m[level] ?? '#94a3b8';
  }

  riskDescription(level: string): string {
    const m: Record<string, string> = {
      Low: 'Reliable vendors with score 80+',
      Medium: 'Average vendors, score 60-79',
      High: 'At-risk vendors, score 40-59',
      Critical: 'Unreliable vendors, score below 40',
    };
    return m[level] ?? '';
  }

  statusBadge(status: string): string {
    const m: Record<string, string> = {
      pending: 'badge-warning', approved: 'badge-info', ordered: 'badge-info',
      delivered: 'badge-success', completed: 'badge-success', cancelled: 'badge-danger',
    };
    return m[status?.toLowerCase()] ?? 'badge-default';
  }

  categoryLabel(val: string): string {
    return this.vendorCategories.find(c => c.value === val)?.label ?? val;
  }

  get drillTitle(): string {
    const vd = this.vendorDrill();
    const cd = this.categoryDrill();
    if (vd) return vd.vendor_name;
    if (cd) return this.categoryLabel(cd.category);
    return '';
  }
}
