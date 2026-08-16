import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';

import { VendorService } from '../../services/vendor.service';
import { AuthService } from '../../services/auth.service';
import { VendorListItem, VendorStatus } from '../../models/vendor.model';
import { StatusActionDialogComponent } from '../status-action-dialog/status-action-dialog.component';

@Component({
  selector: 'app-approval-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule, MatBadgeModule,
    MatChipsModule, MatTooltipModule, MatDialogModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTabsModule, MatFormFieldModule, MatInputModule,
  ],
  template: `
    <div class="page-container">
      <!-- Page header -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 class="mb-0">Vendor Approval Dashboard</h1>
          <p class="text-muted small mb-0">
            Review and manage vendor registrations — only managers can take action
          </p>
        </div>
        <button mat-stroked-button (click)="loadAll()" [disabled]="loading">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>

      <!-- Summary chips -->
      <div class="d-flex gap-3 flex-wrap mb-4">
        <div class="summary-chip pending">
          <mat-icon>hourglass_empty</mat-icon>
          <span><strong>{{ pendingCount }}</strong> Pending</span>
        </div>
        <div class="summary-chip approved">
          <mat-icon>check_circle</mat-icon>
          <span><strong>{{ approvedCount }}</strong> Approved</span>
        </div>
        <div class="summary-chip rejected">
          <mat-icon>cancel</mat-icon>
          <span><strong>{{ rejectedCount }}</strong> Rejected</span>
        </div>
        <div class="summary-chip suspended">
          <mat-icon>block</mat-icon>
          <span><strong>{{ suspendedCount }}</strong> Suspended</span>
        </div>
      </div>

      <!-- Tabs -->
      <mat-card>
        <mat-tab-group (selectedTabChange)="onTabChange($event.index)" animationDuration="200ms">

          <!-- ── PENDING TAB ── -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="me-1">hourglass_empty</mat-icon>
              Pending
              <span class="tab-badge ms-1" *ngIf="pendingCount">{{ pendingCount }}</span>
            </ng-template>
            <ng-template matTabContent>
              <div class="tab-content">
                <ng-container *ngTemplateOutlet="vendorTable; context: {
                  dataSource: pendingDataSource,
                  showActions: true
                }"></ng-container>
              </div>
            </ng-template>
          </mat-tab>

          <!-- ── ALL VENDORS TAB ── -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="me-1">list</mat-icon> All Vendors
            </ng-template>
            <ng-template matTabContent>
              <div class="tab-content">
                <mat-form-field appearance="outline" class="search-field mt-3">
                  <mat-label>Search vendors</mat-label>
                  <input matInput (keyup)="applyFilter($event)" placeholder="Company name, email…">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                <ng-container *ngTemplateOutlet="vendorTable; context: {
                  dataSource: allDataSource,
                  showActions: true
                }"></ng-container>
              </div>
            </ng-template>
          </mat-tab>

        </mat-tab-group>
      </mat-card>
    </div>

    <!-- ─── Vendor table template ─── -->
    <ng-template #vendorTable let-dataSource="dataSource" let-showActions="showActions">
      <div class="table-responsive mt-2" *ngIf="!loading; else spinner">
        <table mat-table [dataSource]="dataSource" matSort class="w-100">

          <!-- Company -->
          <ng-container matColumnDef="company_name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Company</th>
            <td mat-cell *matCellDef="let v">
              <a [routerLink]="['/vendors', v.id]" class="fw-semibold text-decoration-none">
                {{ v.company_name }}
              </a>
            </td>
          </ng-container>

          <!-- Contact -->
          <ng-container matColumnDef="contact_person">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Contact</th>
            <td mat-cell *matCellDef="let v">{{ v.contact_person }}</td>
          </ng-container>

          <!-- Email -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let v">{{ v.email }}</td>
          </ng-container>

          <!-- Category -->
          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
            <td mat-cell *matCellDef="let v">{{ formatCategory(v.category) }}</td>
          </ng-container>

          <!-- Status -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let v">
              <span class="status-chip {{ v.status }}">{{ v.status }}</span>
            </td>
          </ng-container>

          <!-- Registered -->
          <ng-container matColumnDef="created_at">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Registered</th>
            <td mat-cell *matCellDef="let v">{{ v.created_at | date:'dd MMM yyyy' }}</td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let v">
              <div class="d-flex gap-1 flex-wrap">

                <!-- APPROVE -->
                <button mat-raised-button color="primary" class="action-btn"
                        *ngIf="v.status !== 'approved'"
                        (click)="openDialog(v, 'approved')"
                        matTooltip="Approve this vendor">
                  <mat-icon>check</mat-icon> Approve
                </button>

                <!-- REJECT -->
                <button mat-raised-button color="warn" class="action-btn"
                        *ngIf="v.status !== 'rejected'"
                        (click)="openDialog(v, 'rejected')"
                        matTooltip="Reject this vendor">
                  <mat-icon>close</mat-icon> Reject
                </button>

                <!-- SUSPEND -->
                <button mat-stroked-button class="action-btn suspend-btn"
                        *ngIf="v.status === 'approved'"
                        (click)="openDialog(v, 'suspended')"
                        matTooltip="Suspend approved vendor">
                  <mat-icon>block</mat-icon> Suspend
                </button>

                <!-- VIEW -->
                <button mat-icon-button [routerLink]="['/vendors', v.id]" matTooltip="View details">
                  <mat-icon>visibility</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              [class.highlighted]="row.status === 'pending'"></tr>

          <!-- Empty state -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell text-center py-4 text-muted" [attr.colspan]="displayedColumns.length">
              <mat-icon class="d-block mx-auto mb-2 text-muted" style="font-size:40px;width:40px;height:40px">
                inbox
              </mat-icon>
              No vendors found
            </td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </div>

      <ng-template #spinner>
        <div class="d-flex justify-content-center py-5">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      </ng-template>
    </ng-template>
  `,
  styles: [`
    .summary-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px; border-radius: 8px; font-size: 14px;
    }
    .summary-chip.pending  { background: #fff3cd; color: #856404; }
    .summary-chip.approved { background: #d1e7dd; color: #0f5132; }
    .summary-chip.rejected { background: #f8d7da; color: #842029; }
    .summary-chip.suspended{ background: #e2e3e5; color: #41464b; }
    .tab-badge {
      background: #3f51b5; color: white;
      border-radius: 10px; padding: 2px 7px; font-size: 11px;
    }
    .tab-content { padding: 0 16px 16px; }
    .search-field { width: 320px; }
    .action-btn { height: 32px; font-size: 12px; }
    .action-btn mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; }
    .suspend-btn { color: #ff6f00; border-color: #ff6f00; }
    .highlighted { background: #fffde7; }
    mat-table { min-width: 900px; }
  `]
})
export class ApprovalDashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['company_name', 'contact_person', 'email', 'category', 'status', 'created_at', 'actions'];
  pendingDataSource = new MatTableDataSource<VendorListItem>();
  allDataSource     = new MatTableDataSource<VendorListItem>();
  loading = false;

  get pendingCount()  { return this.pendingDataSource.data.length; }
  get approvedCount() { return this.allDataSource.data.filter(v => v.status === 'approved').length; }
  get rejectedCount() { return this.allDataSource.data.filter(v => v.status === 'rejected').length; }
  get suspendedCount(){ return this.allDataSource.data.filter(v => v.status === 'suspended').length; }

  constructor(
    public auth: AuthService,
    private vendorService: VendorService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.vendorService.getAll().subscribe({
      next: vendors => {
        this.allDataSource.data     = vendors;
        this.pendingDataSource.data = vendors.filter(v => v.status === 'pending');
        this.loading = false;
      },
      error: () => {
        this.snack.open('Failed to load vendors', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onTabChange(_index: number): void { /* tabs auto-refresh from shared data */ }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.allDataSource.filter = value.trim().toLowerCase();
  }

  openDialog(vendor: VendorListItem, action: VendorStatus): void {
    const ref = this.dialog.open(StatusActionDialogComponent, {
      width: '480px',
      data: { vendor, action },
    });

    ref.afterClosed().subscribe((remarks: string | undefined) => {
      if (remarks === undefined) return; // cancelled
      this.vendorService.updateStatus(vendor.id, { status: action, remarks }).subscribe({
        next: updated => {
          const label = action.charAt(0).toUpperCase() + action.slice(1);
          this.snack.open(`Vendor ${label} successfully`, 'Close', { duration: 3000, panelClass: ['snack-success'] });
          this.loadAll();
        },
        error: err => {
          this.snack.open(err.error?.detail || 'Action failed', 'Close', { duration: 4000 });
        }
      });
    });
  }

  formatCategory(cat: string): string {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
