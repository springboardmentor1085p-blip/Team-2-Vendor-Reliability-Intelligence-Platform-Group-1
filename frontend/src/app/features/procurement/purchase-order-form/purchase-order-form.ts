import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './purchase-order-form.html',
  styleUrl: './purchase-order-form.scss'
})
export class PurchaseOrderForm {

  purchaseOrder = {
    poNumber: '',
    vendor: '',
    item: '',
    quantity: 1,
    unitPrice: 0,
    orderDate: '',
    expectedDelivery: '',
    status: 'Pending'
  };

  savePurchaseOrder() {

    console.log('Purchase Order Saved');

    console.log(this.purchaseOrder);

    alert('Purchase Order Saved Successfully');

  }

  resetForm() {

    this.purchaseOrder = {
      poNumber: '',
      vendor: '',
      item: '',
      quantity: 1,
      unitPrice: 0,
      orderDate: '',
      expectedDelivery: '',
      status: 'Pending'
    };

  }

}