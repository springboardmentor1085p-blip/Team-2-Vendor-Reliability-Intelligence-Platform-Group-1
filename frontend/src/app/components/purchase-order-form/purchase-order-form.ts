import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-order-form.html',
  styleUrl: './purchase-order-form.css'
})
export class PurchaseOrderForm {

  private apiUrl = 'http://127.0.0.1:8000/purchase-orders/';

  purchaseOrder = {
    poNumber: '',
    vendor: '',
    itemName: '',
    quantity: 0,
    orderDate: '',
    expectedDelivery: '',
    status: 'Pending'
  };

  vendors = [
    'ABC Suppliers',
    'Global Traders',
    'Tech Solutions',
    'Prime Industries',
    'Logistics Hub'
  ];

  message = '';

  constructor(private http: HttpClient) {}

  createPurchaseOrder() {

    if (
      !this.purchaseOrder.poNumber ||
      !this.purchaseOrder.vendor ||
      !this.purchaseOrder.itemName ||
      !this.purchaseOrder.quantity ||
      !this.purchaseOrder.orderDate ||
      !this.purchaseOrder.expectedDelivery
    ) {
      this.message = 'Please fill all fields';
      return;
    }

    const data = {
      po_number: this.purchaseOrder.poNumber.trim(),
      vendor: this.purchaseOrder.vendor,
      item_name: this.purchaseOrder.itemName,
      quantity: this.purchaseOrder.quantity,
      order_date: this.purchaseOrder.orderDate,
      expected_delivery: this.purchaseOrder.expectedDelivery,
      status: this.purchaseOrder.status
    };

    this.http.post(this.apiUrl, data).subscribe({

      next: (response) => {
        console.log('Purchase Order Created:', response);

        this.message = 'Purchase Order Created Successfully';

        this.resetForm();
      },

      error: (error) => {
        console.error('Error creating Purchase Order:', error);

        this.message = 'Failed to create Purchase Order';
      }

    });
  }

  resetForm() {

    this.purchaseOrder = {
      poNumber: '',
      vendor: '',
      itemName: '',
      quantity: 0,
      orderDate: '',
      expectedDelivery: '',
      status: 'Pending'
    };

  }
}