import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'app-purchase-order-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-order-tracking.html',
  styleUrl: './purchase-order-tracking.css'
})
export class PurchaseOrderTracking implements OnInit {

  orders: any[] = [];

  totalOrders = 0;
  pendingOrders = 0;
  orderedOrders = 0;
  deliveredOrders = 0;

constructor(
  private purchaseOrderService: PurchaseOrderService,
  private cdr: ChangeDetectorRef
) {}
  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {

    this.purchaseOrderService.getPurchaseOrders().subscribe({

      next: (data: any[]) => {

  console.log('Purchase Orders:', data);

  this.orders = data;

  this.totalOrders = data.length;

  this.pendingOrders = data.filter(
    order => order.status === 'Pending'
  ).length;

  this.orderedOrders = data.filter(
    order => order.status === 'Ordered'
  ).length;

  this.deliveredOrders = data.filter(
    order => order.status === 'Delivered'
  ).length;

  console.log('Total:', this.totalOrders);
  console.log('Pending:', this.pendingOrders);
  console.log('Ordered:', this.orderedOrders);
  console.log('Delivered:', this.deliveredOrders);

  this.cdr.detectChanges();
},

      error: (error) => {
        console.error(
          'Error loading Purchase Orders:',
          error
        );
      }

    });
  }

  getProgress(status: string): number {

    switch (status) {

      case 'Pending':
        return 20;

      case 'Approved':
        return 40;

      case 'Ordered':
        return 60;

      case 'Delivered':
        return 80;

      case 'Completed':
        return 100;

      case 'Cancelled':
        return 0;

      default:
        return 0;
    }
  }
}