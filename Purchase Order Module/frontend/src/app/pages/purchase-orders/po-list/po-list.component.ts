import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { POStatus, PurchaseOrderListItem } from '../../../models/purchase-order.model';
import { StatusDialogComponent } from '../status-dialog/status-dialog.component';

@Component({
  selector: 'app-po-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatDialogModule, MatTooltipModule,
  ],
  template: `
    <div class="vr-page-header">
      <div>
        <h1 class="vr-title">Purchase Orders</h1>
        <p class="vr-subtitle">{{ total }} order{{ total !== 1 ? 's' : '' }} total</p>
      </div>
      <a routerLink="/purchase-orders/new" class="btn btn-primary d-flex align-items-center gap-2">
        <span class="material-icons" style="font-size:18px">add</span> New Purchase Order
      </a>
    </div>

    <!-- Filters -->
    <div class="vr-card mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-5">
          <label class="form-label small fw-semibold mb-1">Search</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><span class="material-icons" style="font-size:16px">search</span></span>
            <input class="form-control" [(ngModel)]="search" (ngModelChange)="onSearch()"
              placeholder="PO number or title…" />
            @if (search) {
              <button class="btn btn-outline-secondary btn-sm" (click)="search=''; onSearch()">
                <span class="material-icons" style="font-size:14px">close</span>
              </button>
            }
          </div>
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label small fw-semibold mb-1">Status</label>
          <select class="form-select form-select-sm" [(ngModel)]="statusFilter" (ngModelChange)="onFilter()">
            <option value="">All Statuses</option>
            @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
          </select>
        </div>
        <div class="col-6 col-md-2">
          @if (statusFilter || search) {
            <button class="btn btn-outline-secondary btn-sm w-100 mt-3" (click)="clearFilters()">
              Clear Filters
            </button>
          }
        </div>
      </div>
    </div>

    <!-- Table card -->
    <div class="vr-card p-0 vr-table-wrap">
      @if (loading) {
        <div class="vr-loading"><mat-spinner diameter="40" /></div>
      } @else if (!orders.length) {
        <div class="vr-empty">
          <span class="material-icons">inbox</span>
          <p>No purchase orders found</p>
          <a routerLink="/purchase-orders/new" class="btn btn-outline-primary btn-sm mt-2">
            Create First PO
          </a>
        </div>
      } @else {
        <table mat-table [dataSource]="orders">

          <ng-container matColumnDef="po_number">
            <th mat-header-cell *matHeaderCellDef>PO Number</th>
            <td mat-cell *matCellDef="let r">
              <a [routerLink]="['/purchase-orders', r.id]" class="po-link">
                <span class="material-icons" style="font-size:15px;color:#7986cb">receipt</span>
                {{ r.po_number }}
              </a>
            </td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title</th>
            <td mat-cell *matCellDef="let r">
              <span class="fw-medium" style="font-size:13px">{{ r.title }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="vendor">
            <th mat-header-cell *matHeaderCellDef>Vendor</th>
            <td mat-cell *matCellDef="let r">
              <div class="fw-semibold" style="font-size:13px">{{ r.vendor.company_name }}</div>
              <div class="text-muted" style="font-size:11px;font-family:monospace">{{ r.vendor.vendor_code }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>Priority</th>
            <td mat-cell *matCellDef="let r">
              <span [class]="'priority-badge p-' + r.priority.toLowerCase()">
                <span class="material-icons" style="font-size:13px">{{ priorityIcon(r.priority) }}</span>
                {{ r.priority }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let r">
              <span [class]="'status-badge s-' + r.status.toLowerCase()">{{ r.status }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let r">
              <span class="fw-bold" style="font-family:monospace;color:#1a237e;font-size:13px">
                {{ r.currency }} {{ r.total_amount | number:'1.2-2' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let r">
              <span class="text-muted small">{{ r.created_at | date:'MMM d, y' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r">
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Actions">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu>
                <button mat-menu-item [routerLink]="['/purchase-orders', r.id]">
                  <mat-icon>visibility</mat-icon> View Details
                </button>
                <button mat-menu-item (click)="openStatusDialog(r)">
                  <mat-icon>swap_horiz</mat-icon> Update Status
                </button>
                @if (r.status === 'Pending' || r.status === 'Cancelled') {
                  <button mat-menu-item (click)="deletePO(r)">
                    <mat-icon color="warn">delete</mat-icon> Delete
                  </button>
                }
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let r; columns: cols;" class="table-row-hover"></tr>
        </table>

        <mat-paginator
          [length]="total" [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)" showFirstLastButtons />
      }
    </div>
  `,
  styles: [`
    .po-link {
      display: flex; align-items: center; gap: 5px;
      color: #1a237e; font-family: monospace; font-weight: 700;
      font-size: 13px; text-decoration: none;
      &:hover { text-decoration: underline; }
    }
    .priority-badge {
      display: inline-flex; align-items: center; gap: 3px;
      font-size: 12px; font-weight: 600;
      &.p-low      { color: #78909c; }
      &.p-medium   { color: #f57c00; }
      &.p-high     { color: #e53935; }
      &.p-critical { color: #b71c1c; }
    }
    ::ng-deep .table-row-hover:hover { background: #f5f6ff !important; cursor: pointer; }
  `],
})
export class PoListComponent implements OnInit {
  orders: PurchaseOrderListItem[] = [];
  total = 0; loading = false;
  pageSize = 20; pageIndex = 0;
  search = ''; statusFilter = '';

  statuses: POStatus[] = ['Pending', 'Approved', 'Dispatched', 'Delivered', 'Completed', 'Cancelled'];
  cols = ['po_number', 'title', 'vendor', 'priority', 'status', 'amount', 'date', 'actions'];

  constructor(
    private poSvc: PurchaseOrderService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.poSvc.list({
      skip: this.pageIndex * this.pageSize,
      limit: this.pageSize,
      status: this.statusFilter || undefined,
      search: this.search || undefined,
    }).subscribe({
      next: r => { this.orders = r.items; this.total = r.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onSearch(): void  { this.pageIndex = 0; this.load(); }
  onFilter(): void  { this.pageIndex = 0; this.load(); }
  clearFilters(): void { this.search = ''; this.statusFilter = ''; this.pageIndex = 0; this.load(); }
  onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  priorityIcon(p: string): string {
    const m: Record<string, string> = {
      Low: 'arrow_downward', Medium: 'remove', High: 'arrow_upward', Critical: 'priority_high',
    };
    return m[p] ?? 'remove';
  }

  openStatusDialog(row: PurchaseOrderListItem): void {
    const ref = this.dialog.open(StatusDialogComponent, {
      width: '440px',
      data: { currentStatus: row.status, poNumber: row.po_number },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.poSvc.updateStatus(row.id, result).subscribe({
        next: () => {
          this.snack.open('✅ Status updated', '', { duration: 3000, panelClass: 'snack-success' });
          this.load();
        },
        error: e => this.snack.open(e.error?.detail || 'Update failed', '', { duration: 4000, panelClass: 'snack-error' }),
      });
    });
  }

  deletePO(row: PurchaseOrderListItem): void {
    if (!confirm(`Delete ${row.po_number}? This cannot be undone.`)) return;
    this.poSvc.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Deleted', '', { duration: 2500, panelClass: 'snack-success' });
        this.load();
      },
      error: e => this.snack.open(e.error?.detail || 'Delete failed', '', { duration: 4000, panelClass: 'snack-error' }),
    });
  }
}
