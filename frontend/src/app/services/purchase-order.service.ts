import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  private api = 'http://127.0.0.1:8000/purchase-orders';

  constructor(private http: HttpClient) {}

  getAllPurchaseOrders() {
    return this.http.get<any[]>(this.api);
  }

  getPO(id: number) { return this.http.get(`http://127.0.0.1:8000/purchase-orders/${id}`); }

  updateStatus(id: number, status: string) {
    return this.http.put(`${this.api}/${id}?status=${status}`, {});
  }

}