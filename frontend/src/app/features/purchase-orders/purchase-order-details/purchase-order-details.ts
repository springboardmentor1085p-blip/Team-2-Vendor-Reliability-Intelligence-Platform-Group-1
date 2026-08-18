import {
  Component,
  OnInit,
  inject,
  DestroyRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PurchaseOrderService } from '../../../core/services/purchase-order';
import { PurchaseOrder } from '../../../core/models/purchase-order';

@Component({
  selector: 'app-purchase-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './purchase-order-details.html',
  styleUrl: './purchase-order-details.scss'
})
export class PurchaseOrderDetails implements OnInit {
  private poService = inject(PurchaseOrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  purchaseOrder: PurchaseOrder | null = null;

  loading = true;
  error = false;
  errorMessage = '';

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = true;
      this.errorMessage =
        'No Purchase Order ID provided.';
      this.loading = false;
      return;
    }

    this.loadDetails(Number(id));
  }

  private loadDetails(id: number): void {
    this.poService
      .getPurchaseOrderById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.purchaseOrder = data;
          this.loading = false;
        },
        error: err => {
          console.error(err);
          this.error = true;
          this.errorMessage =
            'Could not retrieve purchase order details.';
          this.loading = false;
        }
      });
  }

  onDelete(): void {
    if (!this.purchaseOrder) {
      return;
    }

    if (!confirm(
      `Delete ${this.purchaseOrder.po_number}?`
    )) {
      return;
    }

    this.poService
      .deletePurchaseOrder(this.purchaseOrder.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () =>
          this.router.navigate([
            '/purchase-orders'
          ]),
        error: err => {
          console.error(err);
          alert(
            'Failed to delete purchase order.'
          );
        }
      });
  }
}
