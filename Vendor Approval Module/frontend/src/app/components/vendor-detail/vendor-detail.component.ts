import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { VendorService } from '../../services/vendor.service';
import { AuthService } from '../../services/auth.service';
import { Vendor, VendorStatus } from '../../models/vendor.model';
import { StatusActionDialogComponent } from '../status-action-dialog/status-action-dialog.component';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="page-container" *ngIf="vendor; else loadingTpl">
      <!-- Header -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <button mat-icon-button routerLink="/vendors">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="mb-1">{{ vendor.company_name }}</h1>
          <span class="status-chip {{ vendor.status }}">{{ vendor.status }}</span>
        </div>
      </div>

      <div class="row g-4">
        <!-- Left: details -->
        <div class="col-md-8">
          <mat-card>
            <mat-card-header><mat-card-title>Vendor Details</mat-card-title></mat-card-header>
            <mat-card-content class="mt-3">
              <div class="row g-3">
                <div class="col-sm-6">
                  <label class="field-label">Contact Person</label>
                  <div>{{ vendor.contact_person }}</div>
                </div>
                <div class="col-sm-6">
                  <label class="field-label">Email</label>
                  <div>{{ vendor.email }}</div>
                </div>
                <div class="col-sm-6">
                  <label class="field-label">Phone</label>
                  <div>{{ vendor.phone || '—' }}</div>
                </div>
                <div class="col-sm-6">
                  <label class="field-label">Category</label>
                  <div>{{ formatCategory(vendor.category) }}</div>
                </div>
                <div class="col-sm-6">
                  <label class="field-label">Registration No.</label>
                  <div>{{ vendor.registration_number || '—' }}</div>
                </div>
                <div class="col-sm-6">
                  <label class="field-label">Tax ID</label>
                  <div>{{ vendor.tax_id || '—' }}</div>
                </div>
                <div class="col-12">
                  <label class="field-label">Address</label>
                  <div>{{ vendor.address || '—' }}</div>
                </div>
                <div class="col-12">
                  <label class="field-label">Description</label>
                  <div>{{ vendor.description || '—' }}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Status History -->
          <mat-card class="mt-4">
            <mat-card-header><mat-card-title>Status History</mat-card-title></mat-card-header>
            <mat-card-content>
              <div *ngFor="let h of vendor.status_history" class="history-item">
                <div class="history-dot" [ngClass]="h.new_status"></div>
                <div>
                  <div class="fw-semibold">
                    <span *ngIf="h.old_status" class="text-muted">{{ h.old_status }}</span>
                    <span *ngIf="h.old_status"> → </span>
                    <span class="status-chip {{ h.new_status }}">{{ h.new_status }}</span>
                  </div>
                  <div class="small text-muted">
                    by {{ h.changed_by_name || ('User #' + h.changed_by) }}
                    on {{ h.changed_at | date:'dd MMM yyyy HH:mm' }}
                  </div>
                  <div *ngIf="h.remarks" class="small fst-italic mt-1">"{{ h.remarks }}"</div>
                </div>
              </div>
              <div *ngIf="!vendor.status_history.length" class="text-muted small py-2">
                No status changes recorded.
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Right: actions panel (managers only) -->
        <div class="col-md-4" *ngIf="auth.isManager()">
          <mat-card>
            <mat-card-header><mat-card-title>Actions</mat-card-title></mat-card-header>
            <mat-card-content class="d-flex flex-column gap-2 mt-3">

              <button mat-raised-button color="primary"
                      *ngIf="vendor.status !== 'approved'"
                      (click)="changeStatus('approved')">
                <mat-icon>check_circle</mat-icon> Approve Vendor
              </button>

              <button mat-raised-button color="warn"
                      *ngIf="vendor.status !== 'rejected'"
                      (click)="changeStatus('rejected')">
                <mat-icon>cancel</mat-icon> Reject Vendor
              </button>

              <button mat-stroked-button class="suspend-btn"
                      *ngIf="vendor.status === 'approved'"
                      (click)="changeStatus('suspended')">
                <mat-icon>block</mat-icon> Suspend Vendor
              </button>

            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="d-flex justify-content-center align-items-center" style="height:60vh">
        <mat-spinner></mat-spinner>
      </div>
    </ng-template>
  `,
  styles: [`
    .field-label {
      font-size: 11px; text-transform: uppercase;
      color: #888; letter-spacing: .5px; font-weight: 600;
    }
    .history-item {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 12px 0; border-bottom: 1px solid #f0f0f0;
    }
    .history-item:last-child { border-bottom: none; }
    .history-dot {
      width: 12px; height: 12px; border-radius: 50%;
      margin-top: 4px; flex-shrink: 0;
    }
    .history-dot.approved  { background: #198754; }
    .history-dot.rejected  { background: #dc3545; }
    .history-dot.suspended { background: #fd7e14; }
    .history-dot.pending   { background: #ffc107; }
    .suspend-btn { color: #fd7e14 !important; border-color: #fd7e14 !important; }
  `]
})
export class VendorDetailComponent implements OnInit {
  vendor: Vendor | null = null;

  constructor(
    private route: ActivatedRoute,
    private vendorService: VendorService,
    public auth: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.vendorService.getById(id).subscribe({
      next: v => (this.vendor = v),
      error: () => this.snack.open('Vendor not found', 'Close', { duration: 3000 }),
    });
  }

  changeStatus(action: VendorStatus): void {
    if (!this.vendor) return;
    const ref = this.dialog.open(StatusActionDialogComponent, {
      width: '480px',
      data: { vendor: this.vendor, action },
    });
    ref.afterClosed().subscribe((remarks: string | undefined) => {
      if (remarks === undefined || !this.vendor) return;
      this.vendorService.updateStatus(this.vendor.id, { status: action, remarks }).subscribe({
        next: updated => {
          this.vendor = updated;
          const label = action.charAt(0).toUpperCase() + action.slice(1);
          this.snack.open(`Vendor ${label} successfully`, 'Close', { duration: 3000 });
        },
        error: err => this.snack.open(err.error?.detail || 'Action failed', 'Close', { duration: 4000 }),
      });
    });
  }

  formatCategory(cat: string): string {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
