import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { VendorService } from '../../services/vendor.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <h1 class="mb-4">
        Welcome back, {{ auth.currentUser()?.full_name }}
        <span class="badge bg-primary ms-2 fs-6 text-capitalize">
          {{ auth.currentUser()?.role?.replace('_', ' ') }}
        </span>
      </h1>

      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <mat-card class="stat-card">
            <mat-card-content class="d-flex align-items-center gap-3">
              <div class="stat-icon bg-warning-subtle">
                <mat-icon class="text-warning">hourglass_empty</mat-icon>
              </div>
              <div>
                <div class="stat-number">{{ stats.pending }}</div>
                <div class="stat-label">Pending Approval</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        <div class="col-md-3">
          <mat-card class="stat-card">
            <mat-card-content class="d-flex align-items-center gap-3">
              <div class="stat-icon bg-success-subtle">
                <mat-icon class="text-success">check_circle</mat-icon>
              </div>
              <div>
                <div class="stat-number">{{ stats.approved }}</div>
                <div class="stat-label">Approved Vendors</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        <div class="col-md-3">
          <mat-card class="stat-card">
            <mat-card-content class="d-flex align-items-center gap-3">
              <div class="stat-icon bg-danger-subtle">
                <mat-icon class="text-danger">cancel</mat-icon>
              </div>
              <div>
                <div class="stat-number">{{ stats.rejected }}</div>
                <div class="stat-label">Rejected</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        <div class="col-md-3">
          <mat-card class="stat-card">
            <mat-card-content class="d-flex align-items-center gap-3">
              <div class="stat-icon bg-secondary-subtle">
                <mat-icon class="text-secondary">block</mat-icon>
              </div>
              <div>
                <div class="stat-number">{{ stats.suspended }}</div>
                <div class="stat-label">Suspended</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Quick Actions for Managers -->
      <mat-card *ngIf="auth.isManager()" class="mb-4">
        <mat-card-header>
          <mat-card-title>Quick Actions</mat-card-title>
        </mat-card-header>
        <mat-card-content class="d-flex gap-3 mt-2">
          <button mat-raised-button color="primary" routerLink="/approval">
            <mat-icon>approval</mat-icon> Review Pending Vendors
          </button>
          <button mat-raised-button routerLink="/vendors">
            <mat-icon>business</mat-icon> All Vendors
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .stat-card { border-radius: 12px !important; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-number { font-size: 28px; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 13px; color: #666; margin-top: 4px; }
  `]
})
export class DashboardComponent implements OnInit {
  stats = { pending: 0, approved: 0, rejected: 0, suspended: 0 };

  constructor(public auth: AuthService, private vendorService: VendorService) {}

  ngOnInit(): void {
    forkJoin({
      pending:   this.vendorService.getAll('pending'),
      approved:  this.vendorService.getAll('approved'),
      rejected:  this.vendorService.getAll('rejected'),
      suspended: this.vendorService.getAll('suspended'),
    }).subscribe({
      next: res => {
        this.stats.pending   = res.pending.length;
        this.stats.approved  = res.approved.length;
        this.stats.rejected  = res.rejected.length;
        this.stats.suspended = res.suspended.length;
      },
      error: () => {} // not logged in yet — graceful no-op
    });
  }
}
