import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { VendorPerformance } from '../../../core/models/vendor-performance.model';
import { VendorPerformanceService } from '../../../core/services/vendor-performance.service';

@Component({
  selector: 'app-vendor-performance-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './vendor-performance-form.html',
  styleUrls: ['./vendor-performance-form.scss']
})
export class VendorPerformanceForm implements OnInit {

  private vendorPerformanceService = inject(VendorPerformanceService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;

  performanceId = 0;

  loading = false;

  performance: VendorPerformance = {

    vendor_id: 0,

    on_time_deliveries: 0,

    delayed_deliveries: 0,

    quality_rating: 0,

    response_time: 0,

    issue_resolution_time: 0,

    order_completion_rate: 0,

    service_rating: 0,

    performance_score: 0

  };

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEdit = true;

      this.performanceId = Number(id);

      this.loadPerformance();

    }

  }

  loadPerformance(): void {

    this.loading = true;

    this.vendorPerformanceService
      .getVendorPerformanceById(this.performanceId)
      .subscribe({

        next: (data) => {

          this.performance = data;

          this.loading = false;

        },

        error: (err) => {

          console.error(err);

          this.loading = false;

          alert('Unable to load Vendor Performance.');

        }

      });

  }

  savePerformance(): void {

    if (this.performance.vendor_id <= 0) {

      alert('Vendor ID is required.');

      return;

    }

    this.loading = true;

    if (this.isEdit) {

      this.vendorPerformanceService
        .updateVendorPerformance(
          this.performanceId,
          this.performance
        )
        .subscribe({

          next: () => {

            this.loading = false;

            alert('Vendor Performance Updated Successfully.');

            this.router.navigate(['/vendor-performance']);

          },

          error: (err) => {

            console.error(err);

            this.loading = false;

            alert('Update Failed.');

          }

        });

    } else {

      this.vendorPerformanceService
        .createVendorPerformance(this.performance)
        .subscribe({

          next: () => {

            this.loading = false;

            alert('Vendor Performance Added Successfully.');

            this.router.navigate(['/vendor-performance']);

          },

          error: (err) => {

            console.error(err);

            this.loading = false;

            alert('Creation Failed.');

          }

        });

    }

  }

  resetForm(): void {

    this.performance = {

      vendor_id: 0,

      on_time_deliveries: 0,

      delayed_deliveries: 0,

      quality_rating: 0,

      response_time: 0,

      issue_resolution_time: 0,

      order_completion_rate: 0,

      service_rating: 0,

      performance_score: 0

    };

  }

}