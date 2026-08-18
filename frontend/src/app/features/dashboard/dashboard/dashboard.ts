import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VendorService } from '../../../core/services/vendor';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private vendorService = inject(VendorService);
  private router = inject(Router);

  totalVendors = 0;
  activeVendors = 0;
  pendingVendors = 0;

  activePercentage = 0;
  pendingPercentage = 0;

  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = false;

    this.vendorService.getAllVendors().subscribe({
      next: (vendors) => {
        this.totalVendors = vendors ? vendors.length : 0;

        this.activeVendors = (vendors || []).filter((vendor) =>
          this.isActiveVendor(vendor)
        ).length;

        this.pendingVendors = (vendors || []).filter((vendor) =>
          this.isPendingVendor(vendor)
        ).length;

        if (this.totalVendors > 0) {
          this.activePercentage = Math.round(
            (this.activeVendors / this.totalVendors) * 100
          );

          this.pendingPercentage = Math.round(
            (this.pendingVendors / this.totalVendors) * 100
          );
        } else {
          this.activePercentage = 0;
          this.pendingPercentage = 0;
        }

        this.loading = false;
      },

      error: (err) => {
        console.error('Dashboard loading failed:', err);

        this.loading = false;
        this.error = true;

        this.totalVendors = 0;
        this.activeVendors = 0;
        this.pendingVendors = 0;
        this.activePercentage = 0;
        this.pendingPercentage = 0;
      }
    });
  }

  private isActiveVendor(vendor: any): boolean {
    if (!vendor) {
      return false;
    }

    if (vendor.is_active === true) {
      return true;
    }

    const status = String(vendor.status ?? '')
      .trim()
      .toLowerCase();

    return (
      status === 'active' ||
      status === 'approved' ||
      status === 'verified'
    );
  }

  private isPendingVendor(vendor: any): boolean {
    if (!vendor) {
      return false;
    }

    const status = String(vendor.status ?? '')
      .trim()
      .toLowerCase();

    return status === 'pending';
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}