import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PurchaseOrderService } from '../../../core/services/purchase-order';
import { VendorService } from '../../../core/services/vendor';
import { Vendor } from '../../../core/models/vendor.model';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './purchase-order-form.html',
  styleUrl: './purchase-order-form.scss'
})
export class PurchaseOrderForm implements OnInit {
  private fb = inject(FormBuilder);
  private poService = inject(PurchaseOrderService);
  private vendorService = inject(VendorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  poForm!: FormGroup;
  isEditMode = false;
  poId: number | null = null;
  vendors: Vendor[] = [];
  submitting = false;
  loadingData = false;
  errorMessage = '';

  ngOnInit(): void {
    this.initForm();
    this.loadVendors();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.poId = Number(idParam);
      this.loadExistingPo(this.poId);
    }
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.poForm = this.fb.group({
      po_number: ['', [Validators.required, Validators.maxLength(50)]],
      vendor_id: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      order_date: [today, Validators.required],
      expected_delivery_date: [''],
      status: ['draft', Validators.required],
      payment_status: ['pending', Validators.required],
      notes: ['']
    });
  }

  private loadVendors(): void {
    this.vendorService
      .getAllVendors()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.vendors = (data || []).filter((v) => v.is_active !== false);
        },
        error: (err) => {
          console.error('Error fetching vendors:', err);
        }
      });
  }

  private loadExistingPo(id: number): void {
    this.loadingData = true;

    this.poService
      .getPurchaseOrderById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (po) => {
          this.poForm.patchValue({
            po_number: po.po_number,
            vendor_id: po.vendor_id,
            amount: po.amount,
            order_date: po.order_date
              ? po.order_date.split('T')[0]
              : '',
            expected_delivery_date: po.expected_delivery_date
              ? po.expected_delivery_date.split('T')[0]
              : '',
            status: po.status,
            payment_status: po.payment_status,
            notes: po.notes || ''
          });

          this.loadingData = false;
        },
        error: (err) => {
          console.error('Failed to load purchase order:', err);
          this.errorMessage = 'Could not load existing purchase order data.';
          this.loadingData = false;
        }
      });
  }

  onSubmit(): void {
    if (this.poForm.invalid) {
      this.poForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = {
      ...this.poForm.value,
      vendor_id: Number(this.poForm.value.vendor_id),
      amount: Number(this.poForm.value.amount),
      expected_delivery_date:
        this.poForm.value.expected_delivery_date || null
    };

    if (this.isEditMode && this.poId !== null) {
      this.poService
        .updatePurchaseOrder(this.poId, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.router.navigate([
              '/purchase-orders/details',
              this.poId
            ]);
          },
          error: (err) => {
            console.error('Update PO error:', err);
            this.errorMessage =
              err?.error?.detail ||
              'Failed to update purchase order.';
            this.submitting = false;
          }
        });
    } else {
      this.poService
        .createPurchaseOrder(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.router.navigate(['/purchase-orders']);
          },
          error: (err) => {
            console.error('Create PO error:', err);
            this.errorMessage =
              err?.error?.detail ||
              'Failed to create purchase order.';
            this.submitting = false;
          }
        });
    }
  }
}
