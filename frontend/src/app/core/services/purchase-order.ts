import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto
} from '../models/purchase-order';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private http = inject(HttpClient);

  private readonly API_URL =
    'http://127.0.0.1:8000/purchase-orders';

  getAllPurchaseOrders(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(this.API_URL);
  }

  getPurchaseOrderById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(
      `${this.API_URL}/${id}`
    );
  }

  createPurchaseOrder(
    data: CreatePurchaseOrderDto
  ): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(
      this.API_URL,
      data
    );
  }

  updatePurchaseOrder(
    id: number,
    data: UpdatePurchaseOrderDto
  ): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(
      `${this.API_URL}/${id}`,
      data
    );
  }

  deletePurchaseOrder(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/${id}`
    );
  }
}
