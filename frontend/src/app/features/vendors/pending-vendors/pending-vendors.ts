import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vendor } from '../../../core/models/vendor.model';
import { VendorService } from '../../../core/services/vendor';

@Component({
  selector: 'app-pending-vendors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-vendors.html',
  styleUrl: './pending-vendors.scss'
})
export class PendingVendors implements OnInit {

  private vendorService = inject(VendorService);

  vendors: Vendor[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadPendingVendors();
  }

  loadPendingVendors(): void {
    this.loading = true;

    this.vendorService.getPendingVendors().subscribe({
      next: (data) => {
        this.vendors = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading pending vendors', err);
        this.loading = false;
        this.vendors = [];
      }
    });
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

  approveVendor(id: number): void {
    if (!confirm('Approve this vendor and activate them for procurement?')) {
      return;
    }

    this.vendorService.approveVendor(id).subscribe({
      next: () => {
        this.loadPendingVendors();
      },
      error: (err) => {
        console.error('Error approving vendor', err);
      }
    });
  }

  rejectVendor(id: number): void {
    if (!confirm('Reject this vendor registration?')) {
      return;
    }

    this.vendorService.rejectVendor(id).subscribe({
      next: () => {
        this.loadPendingVendors();
      },
      error: (err) => {
        console.error('Error rejecting vendor', err);
      }
    });
  }
}
