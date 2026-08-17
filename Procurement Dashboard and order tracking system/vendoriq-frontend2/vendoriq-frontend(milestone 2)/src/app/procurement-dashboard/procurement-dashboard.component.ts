import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { MatCardModule }           from '@angular/material/card';
import { MatTableModule }          from '@angular/material/table';
import { MatFormFieldModule }      from '@angular/material/form-field';
import { MatInputModule }          from '@angular/material/input';
import { MatSelectModule }         from '@angular/material/select';
import { MatButtonModule }         from '@angular/material/button';
import { MatIconModule }           from '@angular/material/icon';
import { MatChipsModule }          from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule }     from '@angular/material/datepicker';
import { MatNativeDateModule }     from '@angular/material/core';
import { MatTooltipModule }        from '@angular/material/tooltip';

import { PoService, PurchaseOrder, POSummary, POStatus, POFilters } from './po.service';

// ── Status metadata ──────────────────────────────────────────────────────────

interface StatusMeta {
  label: string;
  color: string;      // chip background
  textColor: string;  // chip text
  barColor: string;   // chart bar fill
  icon: string;
}

const STATUS_META: Record<POStatus, StatusMeta> = {
  pending:   { label: 'Pending',   color: '#fff8e1', textColor: '#f57f17', barColor: '#ffc107', icon: 'schedule'         },
  approved:  { label: 'Approved',  color: '#e8f5e9', textColor: '#2e7d32', barColor: '#4caf50', icon: 'check_circle'     },
  shipped:   { label: 'Shipped',   color: '#e3f2fd', textColor: '#1565c0', barColor: '#2196f3', icon: 'local_shipping'   },
  delivered: { label: 'Delivered', color: '#f3e5f5', textColor: '#6a1b9a', barColor: '#9c27b0', icon: 'inventory_2'      },
  cancelled: { label: 'Cancelled', color: '#fce4ec', textColor: '#c62828', barColor: '#f44336', icon: 'cancel'           },
};

const ALL_STATUSES: POStatus[] = ['pending', 'approved', 'shipped', 'delivered', 'cancelled'];

@Component({
  selector: 'app-procurement-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
  ],
  templateUrl: './procurement-dashboard.component.html',
  styleUrls:   ['./procurement-dashboard.component.css'],
})
export class ProcurementDashboardComponent implements OnInit {

  // ── State ──────────────────────────────────────────────────────────────────
  summary: POSummary | null = null;
  orders: PurchaseOrder[]   = [];
  isLoading    = false;
  summaryError = '';
  tableError   = '';

  // ── Table columns ──────────────────────────────────────────────────────────
  displayedColumns = ['po_number', 'vendor', 'item_description', 'quantity', 'total_amount', 'status', 'order_date'];

  // ── Filter form ────────────────────────────────────────────────────────────
  filterForm!: FormGroup;
  allStatuses  = ALL_STATUSES;
  statusMeta   = STATUS_META;

  constructor(
    private fb: FormBuilder,
    private poService: PoService,
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      status:     [null],
      start_date: [null],
      end_date:   [null],
    });

    this.loadSummary();
    this.loadOrders();
  }

  // ── Data loaders ───────────────────────────────────────────────────────────

  loadSummary(): void {
    this.summaryError = '';
    this.poService.getSummary().subscribe({
      next:  (s) => (this.summary = s),
      error: ()  => (this.summaryError = 'Could not load summary. Is the backend running?'),
    });
  }

  loadOrders(filters: POFilters = {}): void {
    this.isLoading  = true;
    this.tableError = '';
    this.poService.getPurchaseOrders(filters).subscribe({
      next: (data) => {
        this.orders    = data;
        this.isLoading = false;
      },
      error: () => {
        this.tableError = 'Could not load purchase orders.';
        this.isLoading  = false;
      },
    });
  }

  // ── Filter actions ─────────────────────────────────────────────────────────

  applyFilters(): void {
    const raw = this.filterForm.value;
    const filters: POFilters = {};
    if (raw.status)     filters.status     = raw.status;
    if (raw.start_date) filters.start_date = this.toDateString(raw.start_date);
    if (raw.end_date)   filters.end_date   = this.toDateString(raw.end_date);
    this.loadOrders(filters);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadOrders();
  }

  // ── Chart helpers ──────────────────────────────────────────────────────────

  /** Returns bar width as a percentage of total for the given count. */
  barWidth(count: number): number {
    if (!this.summary || this.summary.total === 0) return 0;
    return Math.round((count / this.summary.total) * 100);
  }

  statusCount(status: POStatus): number {
    return this.summary ? (this.summary as any)[status] : 0;
  }

  // ── Display helpers ────────────────────────────────────────────────────────

  getMeta(status: string): StatusMeta {
    return STATUS_META[status as POStatus] ?? { label: status, color: '#eee', textColor: '#333', barColor: '#bbb', icon: 'help' };
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
  }

  private toDateString(d: Date | string): string {
    if (typeof d === 'string') return d;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
