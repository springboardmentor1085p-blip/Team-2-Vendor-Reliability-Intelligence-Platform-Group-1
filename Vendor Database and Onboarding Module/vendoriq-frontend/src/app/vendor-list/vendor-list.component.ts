import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  VendorService,
  VendorResponse,
  VendorUpdatePayload
} from '../vendor-registration/vendor.service';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.css'
})
export class VendorListComponent implements OnInit {

  vendors: VendorResponse[] = [];
  isLoading = false;
  isSaving = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  /** ID of the vendor currently being edited. null means no edit is open. */
  editingVendorId: number | null = null;

  editForm = new FormGroup({
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
    ]),
    status: new FormControl('pending', [Validators.required])
  });

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void {
    this.loadVendors();
  }

  // ── Data loading ───────────────────────────────────────────────────────────

  loadVendors(): void {
    this.isLoading = true;
    this.clearMessages();

    this.vendorService.getVendors().subscribe({
      next: (data) => {
        this.vendors = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.extractError(err, 'Failed to load vendors.');
      }
    });
  }

  // ── Edit ───────────────────────────────────────────────────────────────────

  openEdit(vendor: VendorResponse): void {
    this.editingVendorId = vendor.id;
    this.clearMessages();
    this.editForm.setValue({
      vendorName: vendor.vendorName,
      email:      vendor.email,
      phone:      vendor.phone ?? '',
      address:    vendor.address ?? '',
      status:     vendor.status
    });
  }

  cancelEdit(): void {
    this.editingVendorId = null;
    this.editForm.reset();
    this.clearMessages();
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    if (this.editingVendorId === null) return;

    this.isSaving = true;
    this.clearMessages();

    const payload: VendorUpdatePayload = {
      vendorName: this.editForm.value.vendorName!,
      email:      this.editForm.value.email!,
      phone:      this.editForm.value.phone || null,
      address:    this.editForm.value.address || null,
      status:     this.editForm.value.status as 'pending' | 'approved' | 'rejected'
    };

    this.vendorService.updateVendor(this.editingVendorId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.editingVendorId = null;
        this.editForm.reset();
        this.successMessage = 'Vendor updated successfully.';
        this.loadVendors();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = this.extractError(err, 'Failed to update vendor.');
      }
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  confirmDelete(vendor: VendorResponse): void {
    const confirmed = window.confirm(
      `Delete vendor "${vendor.vendorName}"?\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    this.clearMessages();

    this.vendorService.deleteVendor(vendor.id).subscribe({
      next: () => {
        this.successMessage = `Vendor "${vendor.vendorName}" was deleted.`;
        // If the deleted vendor was being edited, close the form
        if (this.editingVendorId === vendor.id) {
          this.editingVendorId = null;
          this.editForm.reset();
        }
        this.loadVendors();
      },
      error: (err) => {
        this.errorMessage = this.extractError(err, 'Failed to delete vendor.');
      }
    });
  }

  // ── Convenience getters for edit form ──────────────────────────────────────

  get editVendorName() { return this.editForm.get('vendorName'); }
  get editEmail()      { return this.editForm.get('email'); }
  get editPhone()      { return this.editForm.get('phone'); }
  get editAddress()    { return this.editForm.get('address'); }
  get editStatus()     { return this.editForm.get('status'); }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  private extractError(err: any, fallback: string): string {
    const detail = err?.error?.detail;
    return typeof detail === 'string' ? detail : fallback;
  }
}
