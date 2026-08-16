import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl, FormArray, FormBuilder,
  FormGroup, ReactiveFormsModule, Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { VendorService } from '../../../services/vendor.service';
import { Vendor } from '../../../models/vendor.model';
import { POPriority } from '../../../models/purchase-order.model';

@Component({
  selector: 'app-po-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatStepperModule,
    MatDividerModule, MatTooltipModule,
  ],
  templateUrl: './po-form.component.html',
  styleUrls: ['./po-form.component.scss'],
})
export class PoFormComponent implements OnInit {

  // ── One FormGroup per stepper step ──────────────────────────────────
  step1!: FormGroup;  // Order Details
  step2!: FormGroup;  // Line Items
  step3!: FormGroup;  // Financials & Delivery
  step4!: FormGroup;  // Notes

  vendors: Vendor[] = [];
  loading = false;
  vendorsLoading = true;

  priorities: POPriority[] = ['Low', 'Medium', 'High', 'Critical'];  currencies = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD', 'AUD', 'CAD'];
  shippingMethods = [
    'Standard Delivery', 'Express Delivery', 'Overnight',
    'Courier', 'Freight', 'Pickup',
  ];

  subtotal = 0;
  taxAmount = 0;
  totalAmount = 0;

  constructor(
    private fb: FormBuilder,
    private poService: PurchaseOrderService,
    private vendorService: VendorService,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadVendors();
  }

  // ── Build separate form groups per step ─────────────────────────────
  private buildForms(): void {
    this.step1 = this.fb.group({
      vendor_id:              [null, Validators.required],
      title:                  ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      description:            [''],
      priority:               ['Medium', Validators.required],
      required_date:          [null],
      expected_delivery_date: [null],
    });

    this.step2 = this.fb.group({
      items: this.fb.array([this.newItem()]),
    });

    this.step3 = this.fb.group({
      currency:        ['USD', Validators.required],
      tax_rate:        [0, [Validators.min(0), Validators.max(100)]],
      discount_amount: [0, Validators.min(0)],
      delivery_address: [''],
      shipping_method:  [''],
    });

    this.step4 = this.fb.group({
      internal_notes: [''],
      vendor_notes:   [''],
    });

    // Recalculate totals when items or tax/discount change
    this.itemsArray.valueChanges.subscribe(() => this.recalc());
    this.step3.get('tax_rate')!.valueChanges.subscribe(() => this.recalc());
    this.step3.get('discount_amount')!.valueChanges.subscribe(() => this.recalc());
  }

  // ── Items array helpers ──────────────────────────────────────────────
  newItem(): FormGroup {
    return this.fb.group({
      item_code:   [''],
      item_name:   ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      quantity:    [1,  [Validators.required, Validators.min(0.001)]],
      unit:        ['pcs', Validators.required],
      unit_price:  [0,  [Validators.required, Validators.min(0)]],
      notes:       [''],
    });
  }

  get itemsArray(): FormArray {
    return this.step2.get('items') as FormArray;
  }

  get itemControls(): AbstractControl[] {
    return this.itemsArray.controls;
  }

  addItem(): void {
    this.itemsArray.push(this.newItem());
  }

  removeItem(i: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(i);
    }
  }

  lineTotal(i: number): number {
    const g = this.itemsArray.at(i) as FormGroup;
    return (+(g.get('quantity')?.value || 0)) * (+(g.get('unit_price')?.value || 0));
  }

  // ── Running totals ───────────────────────────────────────────────────
  recalc(): void {
    this.subtotal = this.itemsArray.controls.reduce(
      (sum, c) => sum + (+(c.get('quantity')?.value || 0)) * (+(c.get('unit_price')?.value || 0)),
      0,
    );
    const tax  = +(this.step3.get('tax_rate')?.value || 0);
    const disc = +(this.step3.get('discount_amount')?.value || 0);
    this.taxAmount    = this.subtotal * tax / 100;
    this.totalAmount  = this.subtotal + this.taxAmount - disc;
  }

  // ── Vendor loading ───────────────────────────────────────────────────
  private loadVendors(): void {
    this.vendorService.listApproved().subscribe({
      next: r => { this.vendors = r.items; this.vendorsLoading = false; },
      error: () => { this.vendorsLoading = false; },
    });
  }

  getVendorName(): string {
    const v = this.vendors.find(x => x.id === this.step1.get('vendor_id')?.value);
    return v ? v.company_name : '—';
  }

  getMonthPrefix(): string {
    const n = new Date();
    return `${n.getFullYear()}${String(n.getMonth() + 1).padStart(2, '0')}`;
  }

  // ── Submit ───────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.step1.invalid || this.step2.invalid || this.step3.invalid) {
      this.step1.markAllAsTouched();
      this.step2.markAllAsTouched();
      this.step3.markAllAsTouched();
      this.snack.open('Please fix validation errors before submitting', '', {
        duration: 3000, panelClass: 'snack-error',
      });
      return;
    }

    this.loading = true;
    const s1 = this.step1.value;
    const s3 = this.step3.value;
    const s4 = this.step4.value;

    const payload = {
      vendor_id:              s1.vendor_id,
      title:                  s1.title,
      description:            s1.description || undefined,
      priority:               s1.priority,
      required_date:          s1.required_date ? new Date(s1.required_date).toISOString() : undefined,
      expected_delivery_date: s1.expected_delivery_date
                                ? new Date(s1.expected_delivery_date).toISOString()
                                : undefined,
      currency:               s3.currency,
      tax_rate:               +s3.tax_rate,
      discount_amount:        +s3.discount_amount,
      delivery_address:       s3.delivery_address || undefined,
      shipping_method:        s3.shipping_method  || undefined,
      internal_notes:         s4.internal_notes   || undefined,
      vendor_notes:           s4.vendor_notes     || undefined,
      items: this.itemsArray.value.map((it: any) => ({
        item_code:   it.item_code   || undefined,
        item_name:   it.item_name,
        description: it.description || undefined,
        quantity:    +it.quantity,
        unit:        it.unit,
        unit_price:  +it.unit_price,
        notes:       it.notes       || undefined,
      })),
    };

    this.poService.create(payload).subscribe({
      next: po => {
        this.snack.open(`✅ Purchase Order ${po.po_number} created!`, 'View', {
          duration: 6000, panelClass: 'snack-success',
        });
        this.router.navigate(['/purchase-orders', po.id]);
      },
      error: e => {
        this.loading = false;
        this.snack.open(
          e.error?.detail || 'Failed to create Purchase Order',
          '', { duration: 5000, panelClass: 'snack-error' },
        );
      },
    });
  }
}
