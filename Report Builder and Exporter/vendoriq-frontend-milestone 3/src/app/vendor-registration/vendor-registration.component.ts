import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { VendorService, VendorPayload } from './vendor.service';

@Component({
  selector: 'app-vendor-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.css']
})
export class VendorRegistrationComponent implements OnInit {

  form!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      vendorName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email:      ['', [Validators.required, Validators.email]],
      phone:      ['', [Validators.pattern(/^[0-9]{10}$/)]],
      address:    ['', [Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  // ── Convenience getters used in the template ────────────────────────────────
  get vendorName() { return this.form.get('vendorName')!; }
  get email()      { return this.form.get('email')!; }
  get phone()      { return this.form.get('phone')!; }
  get address()    { return this.form.get('address')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const raw = this.form.value;
    const payload: VendorPayload = {
      vendorName: raw.vendorName.trim(),
      email:      raw.email.trim(),
      phone:      raw.phone?.trim() || null,
      address:    raw.address?.trim() || null
    };

    this.vendorService.registerVendor(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = `Vendor "${res.vendorName}" registered successfully!`;
        this.form.reset();
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 409) {
          this.errorMessage = 'A vendor with this email address is already registered.';
        } else if (err.status === 422) {
          this.errorMessage = 'Validation failed. Please check your inputs and try again.';
        } else {
          this.errorMessage = 'Something went wrong. Please try again later.';
        }
      }
    });
  }

  onReset(): void {
    this.form.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }
}
