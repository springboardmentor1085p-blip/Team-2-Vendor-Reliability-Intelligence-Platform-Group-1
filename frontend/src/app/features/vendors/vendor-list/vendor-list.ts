import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Vendor } from '../../../core/models/vendor.model';
import { VendorService } from '../../../core/services/vendor';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-list.html',
  styleUrl: './vendor-list.scss'
})
export class VendorList implements OnInit {

  private vendorService = inject(VendorService);
  private router = inject(Router);

  vendors: Vendor[] = [];

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    this.vendorService.getAllVendors().subscribe({
      next: (data) => {
        this.vendors = data;
      },
      error: (err) => {
        console.error('Error loading vendors', err);
      }
    });
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