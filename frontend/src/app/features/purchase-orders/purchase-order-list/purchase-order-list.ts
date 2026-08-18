import {
  Component,
  OnInit,
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PurchaseOrderService } from '../../../core/services/purchase-order';
import { VendorService } from '../../../core/services/vendor';
import { PurchaseOrder } from '../../../core/models/purchase-order';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-order-list.html',
  styleUrl: './purchase-order-list.scss'
})
export class PurchaseOrderList implements OnInit {
  private poService = inject(PurchaseOrderService);
  private vendorService = inject(VendorService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  purchaseOrders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];
  vendorsMap = new Map<number, string>();

  loading = true;
  error = false;
  errorMessage = '';

  searchTerm = '';
  statusFilter = 'all';
  paymentFilter = 'all';

  ngOnInit(): void {
    this.loadVendorsAndOrders();
  }

  loadVendorsAndOrders(): void {
    this.loading = true;
    this.error = false;

    this.vendorService
      .getAllVendors()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: vendors => {
          this.vendorsMap.clear();

          (vendors || []).forEach(v => {
            if (v.id !== undefined) {
              this.vendorsMap.set(v.id, v.company_name);
            }
          });

          this.loadPurchaseOrders();
        },
        error: () => this.loadPurchaseOrders()
      });
  }

  loadPurchaseOrders(): void {
    this.poService
      .getAllPurchaseOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.purchaseOrders = data || [];
          this.applyFilters();
          this.loading = false;
        },
        error: err => {
          console.error(err);
          this.error = true;
          this.errorMessage =
            'Could not synchronize purchase order records from backend.';
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let list = [...this.purchaseOrders];

    const term = this.searchTerm.trim().toLowerCase();

    if (term) {
      list = list.filter(po =>
        po.po_number?.toLowerCase().includes(term) ||
        this.getVendorName(po).toLowerCase().includes(term) ||
        po.amount?.toString().includes(term)
      );
    }

    if (this.statusFilter !== 'all') {
      list = list.filter(
        po => po.status === this.statusFilter
      );
    }

    if (this.paymentFilter !== 'all') {
      list = list.filter(
        po => po.payment_status === this.paymentFilter
      );
    }

    this.filteredOrders = list;
  }

  getVendorName(po: PurchaseOrder): string {
    return po.vendor?.company_name ||
      this.vendorsMap.get(po.vendor_id) ||
      `Vendor #${po.vendor_id}`;
  }

  viewDetails(id: number): void {
    this.router.navigate([
      '/purchase-orders/details',
      id
    ]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/purchase-orders/add']);
  }

  deletePurchaseOrder(event: Event, id: number): void {
    event.stopPropagation();

    if (!confirm(
      'Are you sure you want to permanently delete this Purchase Order?'
    )) {
      return;
    }

    this.poService
      .deletePurchaseOrder(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.purchaseOrders =
            this.purchaseOrders.filter(po => po.id !== id);

          this.applyFilters();
        },
        error: err => {
          console.error(err);
          alert('Failed to delete Purchase Order.');
        }
      });
  }
}
