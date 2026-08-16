import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VendorService } from '../../services/vendor.service';
import { VendorListItem, VendorStatus } from '../../models/vendor.model';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTableModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTooltipModule, MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="mb-0">All Vendors</h1>
        <button mat-raised-button color="primary" routerLink="/approval">
          <mat-icon>approval</mat-icon> Approval Queue
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="mb-3">
        <mat-card-content class="d-flex gap-3 flex-wrap pt-3">
          <mat-form-field appearance="outline" style="width:260px">
            <mat-label>Search</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Company name, email…">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width:180px">
            <mat-label>Status</mat-label>
            <mat-select (valueChange)="filterByStatus($event)">
              <mat-option value="">All</mat-option>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="approved">Approved</mat-option>
              <mat-option value="rejected">Rejected</mat-option>
              <mat-option value="suspended">Suspended</mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <div class="table-responsive" *ngIf="!loading; else spinner">
          <table mat-table [dataSource]="dataSource" class="w-100">

            <ng-container matColumnDef="company_name">
              <th mat-header-cell *matHeaderCellDef>Company</th>
              <td mat-cell *matCellDef="let v">
                <a [routerLink]="['/vendors', v.id]" class="fw-semibold text-decoration-none">
                  {{ v.company_name }}
                </a>
              </td>
            </ng-container>

            <ng-container matColumnDef="contact_person">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let v">{{ v.contact_person }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let v">{{ v.email }}</td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let v">{{ formatCategory(v.category) }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let v">
                <span class="status-chip {{ v.status }}">{{ v.status }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef>Registered</th>
              <td mat-cell *matCellDef="let v">{{ v.created_at | date:'dd MMM yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let v">
                <button mat-icon-button [routerLink]="['/vendors', v.id]" matTooltip="View details">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell text-center py-4 text-muted" [attr.colspan]="cols.length">
                No vendors found
              </td>
            </tr>
          </table>
        </div>

        <ng-template #spinner>
          <div class="d-flex justify-content-center py-5">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        </ng-template>
      </mat-card>
    </div>
  `,
})
export class VendorListComponent implements OnInit {
  cols = ['company_name', 'contact_person', 'email', 'category', 'status', 'created_at', 'actions'];
  dataSource = new MatTableDataSource<VendorListItem>();
  loading = false;
  allVendors: VendorListItem[] = [];

  constructor(private vendorService: VendorService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.loading = true;
    this.vendorService.getAll().subscribe({
      next: v => {
        this.allVendors = v;
        this.dataSource.data = v;
        this.loading = false;
      },
      error: () => {
        this.snack.open('Failed to load vendors', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilter(e: Event): void {
    this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase();
  }

  filterByStatus(status: VendorStatus | ''): void {
    this.dataSource.data = status
      ? this.allVendors.filter(v => v.status === status)
      : this.allVendors;
  }

  formatCategory(cat: string): string {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
