import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrder } from '../../../models/purchase-order.model';
import { StatusDialogComponent } from '../status-dialog/status-dialog.component';

@Component({
  selector: 'app-po-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, DatePipe,
    MatButtonModule, MatIconModule, MatTableModule, MatDividerModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule, MatTooltipModule,
  ],
  template: `
    <div style="max-width:1100px">
      @if (loading) {
        <div class="vr-loading"><mat-spinner diameter="48" /></div>
      } @else if (!po) {
        <div class="vr-empty">
          <span class="material-icons">error_outline</span>
          <p>Purchase Order not found</p>
          <a routerLink="/purchase-orders" class="btn btn-outline-primary btn-sm">Back to List</a>
        </div>
      } @else {
        <!-- Header -->
        <div class="vr-page-header">
          <div class="d-flex align-items-center gap-3">
            <a routerLink="/purchase-orders" class="btn btn-sm btn-outline-secondary">
              <span class="material-icons" style="font-size:18px;vertical-align:middle">arrow_back</span>
            </a>
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="material-icons" style="color:#7986cb">receipt</span>
                <span style="font-family:monospace;font-size:20px;font-weight:700;color:#1a237e">{{ po.po_number }}</span>
                <span [class]="'status-badge ms-2 s-' + po.status.toLowerCase()">{{ po.status }}</span>
              </div>
              <p class="vr-subtitle mt-1">{{ po.title }}</p>
            </div>
          </div>
          <button class="btn btn-primary d-flex align-items-center gap-2" (click)="openStatusDialog()">
            <span class="material-icons" style="font-size:18px">swap_horiz</span> Update Status
          </button>
        </div>

        <!-- Info + Financials -->
        <div class="row g-3 mb-3">
          <div class="col-12 col-lg-8">
            <div class="vr-card h-100">
              <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="color:#1a237e">
                <span class="material-icons" style="font-size:18px">info</span> Order Information
              </h6>
              <mat-divider class="mb-3" />
              <div class="info-grid">
                <div><span class="il">PO Number</span><span class="iv" style="font-family:monospace;font-weight:700">{{ po.po_number }}</span></div>
                <div><span class="il">Status</span><span class="iv"><span [class]="'status-badge s-'+po.status.toLowerCase()">{{ po.status }}</span></span></div>
                <div><span class="il">Priority</span><span class="iv" [class]="'priority-'+po.priority.toLowerCase()">{{ po.priority }}</span></div>
                <div><span class="il">Vendor</span><span class="iv">{{ po.vendor.company_name }} ({{ po.vendor.vendor_code }})</span></div>
                <div><span class="il">Created By</span><span class="iv">{{ po.created_by_user.full_name }}</span></div>
                <div><span class="il">Created At</span><span class="iv">{{ po.created_at | date:'MMM d, y, h:mm a' }}</span></div>
                @if (po.required_date) {
                  <div><span class="il">Required Date</span><span class="iv">{{ po.required_date | date:'MMM d, y' }}</span></div>
                }
                @if (po.expected_delivery_date) {
                  <div><span class="il">Expected Delivery</span><span class="iv">{{ po.expected_delivery_date | date:'MMM d, y' }}</span></div>
                }
                @if (po.tracking_number) {
                  <div><span class="il">Tracking #</span><span class="iv" style="font-family:monospace">{{ po.tracking_number }}</span></div>
                }
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-4">
            <div class="vr-card h-100">
              <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="color:#1a237e">
                <span class="material-icons" style="font-size:18px">attach_money</span> Financial Summary
              </h6>
              <mat-divider class="mb-3" />
              <div class="fin-row"><span>Subtotal</span><span>{{ po.currency }} {{ po.subtotal | number:'1.2-2' }}</span></div>
              <div class="fin-row"><span>Tax ({{ po.tax_rate }}%)</span><span>{{ po.currency }} {{ po.tax_amount | number:'1.2-2' }}</span></div>
              <div class="fin-row"><span>Discount</span><span>− {{ po.currency }} {{ po.discount_amount | number:'1.2-2' }}</span></div>
              <mat-divider class="my-2" />
              <div class="fin-row fin-total">
                <span>TOTAL</span>
                <strong>{{ po.currency }} {{ po.total_amount | number:'1.2-2' }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Line Items -->
        <div class="vr-card mb-3">
          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="color:#1a237e">
            <span class="material-icons" style="font-size:18px">list_alt</span>
            Line Items ({{ po.items.length }})
          </h6>
          <mat-divider class="mb-3" />
          <table mat-table [dataSource]="po.items" class="w-100">
            <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>Code</th><td mat-cell *matCellDef="let r">{{ r.item_code || '—' }}</td></ng-container>
            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Item</th><td mat-cell *matCellDef="let r"><strong>{{ r.item_name }}</strong></td></ng-container>
            <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef>Qty</th><td mat-cell *matCellDef="let r">{{ r.quantity }} {{ r.unit }}</td></ng-container>
            <ng-container matColumnDef="price"><th mat-header-cell *matHeaderCellDef>Unit Price</th><td mat-cell *matCellDef="let r">{{ po.currency }} {{ r.unit_price | number:'1.2-2' }}</td></ng-container>
            <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef>Line Total</th><td mat-cell *matCellDef="let r"><strong>{{ po.currency }} {{ r.total_price | number:'1.2-2' }}</strong></td></ng-container>
            <tr mat-header-row *matHeaderRowDef="itemCols"></tr>
            <tr mat-row *matRowDef="let r; columns: itemCols;"></tr>
          </table>
        </div>

        <!-- Status History -->
        <div class="vr-card">
          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="color:#1a237e">
            <span class="material-icons" style="font-size:18px">history</span> Status History
          </h6>
          <mat-divider class="mb-3" />
          @for (h of po.status_history; track h.id) {
            <div class="timeline-row">
              <div [class]="'tl-dot s-'+h.new_status.toLowerCase()"></div>
              <div class="tl-content">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  @if (h.previous_status) {
                    <span class="text-muted small">{{ h.previous_status }}</span>
                    <span class="material-icons" style="font-size:14px;color:#90a4ae">arrow_forward</span>
                  }
                  <span [class]="'status-badge s-'+h.new_status.toLowerCase()">{{ h.new_status }}</span>
                  <span class="text-muted small ms-auto">{{ h.changed_at | date:'MMM d, y, h:mm a' }}</span>
                </div>
                @if (h.remarks) { <p class="text-muted small fst-italic mt-1 mb-0">{{ h.remarks }}</p> }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .il { display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#546e7a; }
    .iv { font-size:13px; color:#1a1a2e; font-weight:500; }
    .fin-row { display:flex; justify-content:space-between; font-size:14px; color:#546e7a; margin-bottom:8px; }
    .fin-total { font-size:16px; color:#1a237e; strong{font-size:20px;font-weight:700} }
    .timeline-row { display:flex; gap:14px; align-items:flex-start; margin-bottom:14px; }
    .tl-dot { width:14px; height:14px; border-radius:50%; flex-shrink:0; margin-top:3px;
      &.s-pending{background:#f57c00} &.s-approved{background:#2e7d32} &.s-dispatched{background:#0277bd}
      &.s-delivered{background:#4527a0} &.s-completed{background:#00897b} &.s-cancelled{background:#c62828}
    }
    .tl-content { flex:1; }
    ::ng-deep .mat-mdc-header-row { background:#e8eaf6!important; }
    @media(max-width:768px) { .info-grid { grid-template-columns:1fr; } }
  `],
})
export class PoDetailComponent implements OnInit {
  po: PurchaseOrder | null = null;
  loading = true;
  itemCols = ['code', 'name', 'qty', 'price', 'total'];

  constructor(
    private route: ActivatedRoute,
    private poService: PurchaseOrderService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.poService.getById(id).subscribe({
      next: po => { this.po = po; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openStatusDialog(): void {
    if (!this.po) return;
    const ref = this.dialog.open(StatusDialogComponent, {
      width: '420px',
      data: { currentStatus: this.po.status, poNumber: this.po.po_number },
    });
    ref.afterClosed().subscribe(result => {
      if (result && this.po) {
        this.poService.updateStatus(this.po.id, result).subscribe({
          next: updated => { this.po = updated; this.snack.open('Status updated!', '', { duration: 3000, panelClass: 'snack-success' }); },
          error: e => this.snack.open(e.error?.detail || 'Update failed', '', { duration: 4000, panelClass: 'snack-error' }),
        });
      }
    });
  }
}
