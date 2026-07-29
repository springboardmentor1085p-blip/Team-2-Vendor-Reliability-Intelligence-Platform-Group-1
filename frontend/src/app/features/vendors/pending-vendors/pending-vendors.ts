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

        this.vendors = data;
        this.loading = false;

      },

      error: (err) => {

        console.error(err);

        this.loading = false;
        this.vendors = [];

      }

    });

  }

  approveVendor(id: number): void {

    this.vendorService.approveVendor(id).subscribe({

      next: () => {
        this.loadPendingVendors();
      },

      error: (err) => console.error(err)

    });

  }

  rejectVendor(id: number): void {

    this.vendorService.rejectVendor(id).subscribe({

      next: () => {
        this.loadPendingVendors();
      },

      error: (err) => console.error(err)

    });

  }

}