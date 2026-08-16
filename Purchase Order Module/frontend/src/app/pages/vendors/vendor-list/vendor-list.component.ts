import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VendorService } from '../../../services/vendor.service';
import { Vendor } from '../../../models/vendor.model';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatPaginatorModule,
    MatSnackBarModule, MatTooltipModule,
  ],
  template: `
    <div class="vr-page-header">
      <div>
        <h1 class="vr-title">Vendor Management</h1>
        <p class="vr-subtitle">{{ total }} vendor{{ total !== 1 ? 's' : '' }} registered</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="vr-card mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-5">
          <label class="form-label small fw-semibold mb-1">Search</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text">
              <span class="material-icons" style="font-size:16px">search</span>
            </span>
            <input class="form-control" [(ngModel)]="search" (ngModelChange)="load()"
              placeholder="Company name or vendor code…" />
          </div>
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label small fw-semibold mb-1">Status</label>
          <select class="form-select form-select-sm" [(ngModel)]="statusFilter" (ngModelChange)="load()">
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Suspended">Suspended</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="vr-card p-0 vr-table-wrap">
      @if (loading) {
        <div class="vr-loading"><mat-spinner diameter="40" /></div>
      } @else if (!vendors.length) {
        <div class="vr-empty">
          <span class="material-icons">business_center</span>
          <p>No vendors found</p>
        </div>
      } @else {
        <table mat-table [dataSource]="vendors">

          <ng-container matColumnDef="vendor_code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let r">
              <span style="font-family:monospace;font-weight:700;color:#1a237e;font-size:13px">
                {{ r.vendor_code }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="company_name">
            <th mat-header-cell *matHeaderCellDef>Company</th>
            <td mat-cell *matCellDef="let r">
              <div class="fw-semibold" style="font-size:13px">{{ r.company_name }}</div>
              @if (r.contact_person) {
                <div class="text-muted" style="font-size:11px">{{ r.contact_person }}</div>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let r">
              <span class="badge bg-light text-dark border" style="font-size:11px">{{ r.category }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Contact</th>
            <td mat-cell *matCellDef="let r">
              <div class="small">{{ r.email }}</div>
              @if (r.phone) { <div class="text-muted" style="font-size:11px">{{ r.phone }}</div> }
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let r">
              <span [class]="'status-badge s-' + r.status.toLowerCase()">{{ r.status }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r">
              @if (r.status === 'Pending') {
                <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                  (click)="approveVendor(r)" matTooltip="Approve Vendor">
                  <span class="material-icons" style="font-size:16px">check_circle</span> Approve
                </button>
              }
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
    ::ng-deep .table-row-hover:hover { background: #f5f6ff !important; }
  `],
})
export class VendorListComponent implements OnInit {
  vendors: Vendor[] = [];
  total = 0; loading = false;
  pageSize = 20; pageIndex = 0;
  search = ''; statusFilter = '';
  cols = ['vendor_code', 'company_name', 'category', 'email', 'status', 'actions'];

  constructor(private vendorService: VendorService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.vendorService.list({
      skip: this.pageIndex * this.pageSize,
      limit: this.pageSize,
      status: this.statusFilter || undefined,
      search: this.search || undefined,
    }).subscribe({
      next: r => { this.vendors = r.items; this.total = r.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load();
  }

  approveVendor(v: Vendor): void {
    this.vendorService.approve(v.id).subscribe({
      next: () => {
        this.snack.open(`✅ ${v.company_name} approved!`, '', { duration: 3000, panelClass: 'snack-success' });
        this.load();
      },
      error: e => this.snack.open(e.error?.detail || 'Approval failed', '', { duration: 3000, panelClass: 'snack-error' }),
    });
  }
}
