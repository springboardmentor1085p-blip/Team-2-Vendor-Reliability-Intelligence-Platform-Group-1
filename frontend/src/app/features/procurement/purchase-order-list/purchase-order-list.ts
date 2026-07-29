import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseOrder } from '../../../core/models/purchase-order.model';
import { PurchaseOrderService } from '../../../core/services/purchase-order';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-order-list.html',
  styleUrls: ['./purchase-order-list.scss']
})
export class PurchaseOrderList implements OnInit {

  purchaseOrders: PurchaseOrder[] = [];

  private purchaseOrderService = inject(PurchaseOrderService);

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders() {

    this.purchaseOrderService
      .getAllPurchaseOrders()
      .subscribe({

        next: (data) => {

          this.purchaseOrders = data;

        },

        error: (err) => {

          console.error(err);

        }

      });

  }

  delete(id: number) {

    if (!confirm('Delete Purchase Order?')) {
      return;
    }

    this.purchaseOrderService
      .deletePurchaseOrder(id)
      .subscribe(() => {

        this.loadPurchaseOrders();

      });

  }

}