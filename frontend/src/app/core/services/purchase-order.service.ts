import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PurchaseOrder } from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  private http = inject(HttpClient);

  private readonly API_URL = 'http://127.0.0.1:8000/purchase-orders';

  // Get All Purchase Orders
  getAllPurchaseOrders(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(this.API_URL);
  }

  // Get Purchase Order By ID
  getPurchaseOrderById(
    poId: number
  ): Observable<PurchaseOrder> {

    return this.http.get<PurchaseOrder>(
      `${this.API_URL}/${poId}`
    );

  }

  // Create Purchase Order
  createPurchaseOrder(
    purchaseOrder: PurchaseOrder
  ): Observable<PurchaseOrder> {

    return this.http.post<PurchaseOrder>(
      this.API_URL,
      purchaseOrder
    );

  }

  // Update Purchase Order
  updatePurchaseOrder(
    poId: number,
    purchaseOrder: PurchaseOrder
  ): Observable<PurchaseOrder> {

    return this.http.put<PurchaseOrder>(
      `${this.API_URL}/${poId}`,
      purchaseOrder
    );

  }

  // Delete Purchase Order
  deletePurchaseOrder(
    poId: number
  ): Observable<any> {

    return this.http.delete(
      `${this.API_URL}/${poId}`
    );

  }

}