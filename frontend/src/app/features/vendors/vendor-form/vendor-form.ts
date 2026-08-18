import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Vendor } from '../../../core/models/vendor.model';
import { VendorService } from '../../../core/services/vendor';

@Component({
  selector: 'app-vendor-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './vendor-form.html',
  styleUrl: './vendor-form.scss'
})
export class VendorForm implements OnInit {

  private vendorService = inject(VendorService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  vendorId = 0;

  vendor: Vendor = {
    vendor_name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    category: ''
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEdit = true;
      this.vendorId = Number(id);

      this.vendorService
        .getVendorById(this.vendorId)
        .subscribe(data => {
          this.vendor = data;
        });
    }
  }

  saveVendor(): void {
    if (this.isEdit) {
      this.vendorService
        .updateVendor(this.vendorId, this.vendor)
        .subscribe(() => {
          this.router.navigate(['/vendors']);
        });
    } else {
      this.vendorService
        .createVendor(this.vendor)
        .subscribe(() => {
          this.router.navigate(['/vendors']);
        });
    }
  }
}
