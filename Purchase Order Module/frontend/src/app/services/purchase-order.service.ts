import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  POListResponse, POStatusUpdate, POSummaryStats,
  PurchaseOrder, PurchaseOrderCreate,
} from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly base = `${environment.apiUrl}/purchase-orders`;
  constructor(private http: HttpClient) {}

  create(data: PurchaseOrderCreate) {
    return this.http.post<PurchaseOrder>(`${this.base}/`, data);
  }

  list(opts?: { skip?: number; limit?: number; status?: string; vendor_id?: number; search?: string }) {
    let p = new HttpParams();
    if (opts?.skip      != null) p = p.set('skip',      opts.skip);
    if (opts?.limit     != null) p = p.set('limit',     opts.limit);
    if (opts?.status)            p = p.set('status',    opts.status);
    if (opts?.vendor_id != null) p = p.set('vendor_id', opts.vendor_id);
    if (opts?.search)            p = p.set('search',    opts.search);
    return this.http.get<POListResponse>(`${this.base}/`, { params: p });
  }

  getById(id: number)        { return this.http.get<PurchaseOrder>(`${this.base}/${id}`); }
  getByNumber(no: string)    { return this.http.get<PurchaseOrder>(`${this.base}/by-number/${no}`); }
  getStats()                 { return this.http.get<POSummaryStats>(`${this.base}/stats`); }

  updateStatus(id: number, u: POStatusUpdate) {
    return this.http.patch<PurchaseOrder>(`${this.base}/${id}/status`, u);
  }

  delete(id: number) {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
