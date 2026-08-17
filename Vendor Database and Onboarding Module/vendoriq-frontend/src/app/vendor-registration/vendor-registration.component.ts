import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorService, VendorPayload } from './vendor.service';

@Component({
  selector: 'app-vendor-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vendor-registration.component.html',
  styleUrl: './vendor-registration.component.css'
})
export class VendorRegistrationComponent {
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  vendorForm = new FormGroup({
    vendorName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{10}$')
    ]),
    address: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(500)
    ])
  });

  constructor(private vendorService: VendorService) {}

  onSubmit(): void {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    const payload: VendorPayload = {
      vendorName: this.vendorForm.value.vendorName!,
      email: this.vendorForm.value.email!,
      phone: this.vendorForm.value.phone || null,
      address: this.vendorForm.value.address || null
    };

    this.vendorService.registerVendor(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Vendor registered successfully!';
        this.vendorForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        // FastAPI validation/conflict errors include a `detail` field
        const detail = err?.error?.detail;
        this.errorMessage = typeof detail === 'string'
          ? detail
          : 'Something went wrong. Please try again.';
      }
    });
  }

  // Convenience getters for cleaner template access
  get vendorName() { return this.vendorForm.get('vendorName'); }
  get email()      { return this.vendorForm.get('email'); }
  get phone()      { return this.vendorForm.get('phone'); }
  get address()    { return this.vendorForm.get('address'); }
}
