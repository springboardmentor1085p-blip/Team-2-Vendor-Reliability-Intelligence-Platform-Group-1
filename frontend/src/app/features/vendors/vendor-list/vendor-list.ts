import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Vendor } from '../../../core/models/vendor.model';
import { VendorService } from '../../../core/services/vendor';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-list.html',
  styleUrl: './vendor-list.scss'
})
export class VendorList implements OnInit {
  private vendorService = inject(VendorService);
  private router = inject(Router);

  vendors: Vendor[] = [];

  searchTerm = '';
  statusFilter = 'all';

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    this.vendorService.getAllVendors().subscribe({
      next: (data) => {
        this.vendors = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error loading vendors', err);
        this.vendors = [];
      }
    });
  }

  get filteredVendors(): Vendor[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.vendors.filter((vendor) => {
      const matchesSearch =
        !search ||
        String(vendor.vendor_name ?? '').toLowerCase().includes(search) ||
        String(vendor.company_name ?? '').toLowerCase().includes(search) ||
        String(vendor.email ?? '').toLowerCase().includes(search) ||
        String(vendor.category ?? '').toLowerCase().includes(search);

      const status = String(vendor.status ?? '').trim().toLowerCase();

      const matchesStatus =
        this.statusFilter === 'all' ||
        status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  get activeCount(): number {
    return this.vendors.filter((vendor) => {
      const status = String(vendor.status ?? '').trim().toLowerCase();

      return vendor.is_active === true ||
        status === 'active' ||
        status === 'approved' ||
        status === 'verified';
    }).length;
  }

  get pendingCount(): number {
    return this.vendors.filter((vendor) => {
      const status = String(vendor.status ?? '').trim().toLowerCase();
      return status === 'pending';
    }).length;
  }

  getInitials(name: string | undefined): string {
    if (!name) {
      return 'V';
    }

    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  getStatusClass(status: string | undefined): string {
    const normalized = String(status ?? '')
      .trim()
      .toLowerCase();

    if (
      normalized === 'active' ||
      normalized === 'approved' ||
      normalized === 'verified'
    ) {
      return 'status-active';
    }

    if (normalized === 'pending') {
      return 'status-pending';
    }

    if (
      normalized === 'inactive' ||
      normalized === 'rejected' ||
      normalized === 'suspended'
    ) {
      return 'status-inactive';
    }

    return 'status-neutral';
  }

  addVendor(): void {
    this.router.navigate(['/vendors/add']);
  }

  editVendor(id: number): void {
    this.router.navigate(['/vendors/edit', id]);
  }

  deleteVendor(id: number): void {
    if (confirm('Are you sure you want to delete this vendor?')) {
      this.vendorService.deleteVendor(id).subscribe({
        next: () => this.loadVendors(),
        error: (err) => console.error(err)
      });
    }
  }
}