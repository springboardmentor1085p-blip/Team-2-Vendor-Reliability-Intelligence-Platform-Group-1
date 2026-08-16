import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { POSummaryStats } from '../../models/purchase-order.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule],
  template: `
    <!-- Header -->
    <div class="vr-page-header">
      <div>
        <h1 class="vr-title">Procurement Dashboard</h1>
        <p class="vr-subtitle">Live overview of Purchase Orders &amp; vendor activity</p>
      </div>
      <a routerLink="/purchase-orders/new"
        class="btn btn-primary d-flex align-items-center gap-2">
        <span class="material-icons" style="font-size:18px">add</span>
        New Purchase Order
      </a>
    </div>

    @if (loading) {
      <div class="vr-loading"><mat-spinner diameter="48" /></div>
    } @else if (stats) {

      <!-- ── Stat cards ───────────────────────────────────────── -->
      <div class="stat-grid">
        @for (c of cards; track c.label) {
          <div class="stat-card" [style.border-left-color]="c.color">
            <div class="stat-icon-wrap" [style.background]="c.bg">
              <span class="material-icons" [style.color]="c.color">{{ c.icon }}</span>
            </div>
            <div>
              <div class="stat-label">{{ c.label }}</div>
              <div class="stat-value" [style.color]="c.color">{{ c.value }}</div>
            </div>
          </div>
        }
      </div>

      <!-- ── Two column row ──────────────────────────────────── -->
      <div class="row g-4">

        <!-- Status breakdown -->
        <div class="col-12 col-lg-7">
          <div class="vr-card h-100">
            <h6 class="fw-bold mb-1 d-flex align-items-center gap-2" style="color:#1a237e">
              <span class="material-icons" style="font-size:18px">bar_chart</span>
              Order Status Breakdown
            </h6>
            <hr class="mt-2 mb-3" />

            @for (s of statusRows; track s.label) {
              <div class="d-flex align-items-center gap-3 mb-3">
                <span [class]="'status-badge s-' + s.key" style="min-width:90px;justify-content:center">
                  {{ s.label }}
                </span>
                <span class="fw-bold" style="min-width:32px;color:#1a237e;font-size:16px">
                  {{ s.count }}
                </span>
                <div class="flex-grow-1">
                  <div class="progress" style="height:8px;border-radius:4px;background:#eceff1">
                    <div class="progress-bar" role="progressbar"
                      [style.width.%]="stats!.total_orders > 0 ? (s.count / stats!.total_orders * 100) : 0"
                      [style.background]="s.color">
                    </div>
                  </div>
                </div>
                <span class="text-muted small" style="min-width:36px;text-align:right">
                  {{ stats!.total_orders > 0 ? ((s.count / stats!.total_orders * 100) | number:'1.0-0') : 0 }}%
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Quick actions -->
        <div class="col-12 col-lg-5">
          <div class="vr-card h-100">
            <h6 class="fw-bold mb-1 d-flex align-items-center gap-2" style="color:#1a237e">
              <span class="material-icons" style="font-size:18px">flash_on</span>
              Quick Actions
            </h6>
            <hr class="mt-2 mb-3" />
            <div class="d-flex flex-column gap-2">
              <a routerLink="/purchase-orders/new"
                class="btn btn-outline-primary d-flex align-items-center gap-2 text-start">
                <span class="material-icons" style="font-size:18px">add_circle</span>
                Create New Purchase Order
              </a>
              <a routerLink="/purchase-orders"
                class="btn btn-outline-secondary d-flex align-items-center gap-2 text-start">
                <span class="material-icons" style="font-size:18px">list_alt</span>
                View All Orders ({{ stats.total_orders }})
              </a>
              <a routerLink="/vendors"
                class="btn btn-outline-secondary d-flex align-items-center gap-2 text-start">
                <span class="material-icons" style="font-size:18px">business</span>
                Manage Vendors
              </a>
              <a routerLink="/purchase-orders"
                class="btn btn-outline-warning d-flex align-items-center gap-2 text-start">
                <span class="material-icons" style="font-size:18px">pending_actions</span>
                Pending Approvals ({{ stats.pending }})
              </a>
            </div>
          </div>
        </div>

      </div>
    } @else {
      <div class="vr-empty">
        <span class="material-icons">error_outline</span>
        <p>Could not load dashboard data. Make sure the backend is running.</p>
        <button class="btn btn-outline-primary btn-sm mt-2" (click)="load()">Retry</button>
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  stats: POSummaryStats | null = null;
  loading = true;
  cards:      any[] = [];
  statusRows: any[] = [];

  constructor(private poService: PurchaseOrderService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.poService.getStats().subscribe({
      next:  s => { this.stats = s; this.build(s); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  private build(s: POSummaryStats): void {
    const fmt = (v: number) =>
      '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 });

    this.cards = [
      { label: 'Total Orders',          value: s.total_orders,         icon: 'receipt_long',  color: '#1a237e', bg: '#e8eaf6' },
      { label: 'Total Value',            value: fmt(s.total_value),     icon: 'attach_money',  color: '#00897b', bg: '#e0f2f1' },
      { label: "This Month's Orders",    value: s.this_month_orders,    icon: 'calendar_month',color: '#0277bd', bg: '#e3f2fd' },
      { label: "This Month's Value",     value: fmt(s.this_month_value),icon: 'trending_up',   color: '#f57c00', bg: '#fff3e0' },
    ];

    this.statusRows = [
      { label: 'Pending',    key: 'pending',    count: s.pending,    color: '#f57c00' },
      { label: 'Approved',   key: 'approved',   count: s.approved,   color: '#2e7d32' },
      { label: 'Dispatched', key: 'dispatched', count: s.dispatched, color: '#0277bd' },
      { label: 'Delivered',  key: 'delivered',  count: s.delivered,  color: '#4527a0' },
      { label: 'Completed',  key: 'completed',  count: s.completed,  color: '#00897b' },
      { label: 'Cancelled',  key: 'cancelled',  count: s.cancelled,  color: '#c62828' },
    ];
  }
}
