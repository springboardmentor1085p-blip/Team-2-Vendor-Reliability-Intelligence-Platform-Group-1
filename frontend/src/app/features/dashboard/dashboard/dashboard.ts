import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  totalVendors = 0;
  activeVendors = 0;
  pendingVendors = 0;
  reliabilityScore = 95;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {

    this.vendorService.getAllVendors().subscribe({

      next: (vendors) => {

        this.totalVendors = vendors.length;

        this.activeVendors =
          vendors.filter(v => v.is_active).length;

        this.pendingVendors =
          vendors.filter(v => v.status === 'Pending').length;

      },

      error: (err) => {

        console.log('Dashboard loading in offline mode.', err);

        this.totalVendors = 0;
        this.activeVendors = 0;
        this.pendingVendors = 0;

      }

    });

  }

}