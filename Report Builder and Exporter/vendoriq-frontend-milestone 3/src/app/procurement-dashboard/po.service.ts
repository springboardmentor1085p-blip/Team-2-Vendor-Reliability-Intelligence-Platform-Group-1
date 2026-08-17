import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Status type ───────────────────────────────────────────────────────────────

export type POStatus = 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Vendor snapshot nested inside every PO response */
export interface VendorInPO {
  id: number;
  vendor_name: string;
  email: string;
  status: string;
}

/** Full PO object — matches GET /purchase-orders and GET /purchase-orders/{id} */
export interface PurchaseOrder {
  id: number;
  po_number: string;
  vendor_id: number;
  vendor: VendorInPO;
  item_description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: POStatus;
  order_date: string;
  expected_delivery_date: string | null;
  created_at: string;
  updated_at: string | null;
}

/** Response from GET /purchase-orders/summary */
export interface POSummary {
  total: number;
  pending: number;
  approved: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

/** Request body for POST /purchase-orders */
export interface POCreatePayload {
  vendor_id: number;
  po_number: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  order_date?: string;
  expected_delivery_date?: string;
}

/** Request body for PUT /purchase-orders/{id} — all fields optional */
export interface POUpdatePayload {
  status?: POStatus;
  item_description?: string;
  quantity?: number;
  unit_price?: number;
  total_amount?: number;
  expected_delivery_date?: string;
}

/** Query filters accepted by GET /purchase-orders */
export interface POFilters {
  status?: POStatus | null;
  start_date?: string | null;   // YYYY-MM-DD
  end_date?: string | null;     // YYYY-MM-DD
  vendor_id?: number | null;
}

/** A single sample row returned by GET /reports/purchase-orders/preview */
export interface ReportPreviewRow {
  po_number:    string;
  vendor_id:    string;
  status:       string;
  order_date:   string;
  total_amount: string;
}

/** Full response from GET /reports/purchase-orders/preview */
export interface ReportPreview {
  total_records:  number;
  format_options: string[];
  sample_rows:    ReportPreviewRow[];
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PoService {
  private readonly base        = 'http://127.0.0.1:8000/purchase-orders';
  private readonly reportsBase = 'http://127.0.0.1:8000/reports';

  constructor(private http: HttpClient) {}

  /** GET /purchase-orders/summary */
  getSummary(): Observable<POSummary> {
    return this.http.get<POSummary>(`${this.base}/summary`);
  }

  /** GET /purchase-orders — all filters are optional */
  getPurchaseOrders(filters: POFilters = {}): Observable<PurchaseOrder[]> {
    let params = new HttpParams();
    if (filters.status)     params = params.set('status',     filters.status);
    if (filters.start_date) params = params.set('start_date', filters.start_date);
    if (filters.end_date)   params = params.set('end_date',   filters.end_date);
    if (filters.vendor_id)  params = params.set('vendor_id',  filters.vendor_id.toString());
    return this.http.get<PurchaseOrder[]>(this.base, { params });
  }

  /** GET /purchase-orders/{id} */
  getPurchaseOrderById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.base}/${id}`);
  }

  /** POST /purchase-orders */
  createPurchaseOrder(data: POCreatePayload): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.base, data);
  }

  /** PUT /purchase-orders/{id} */
  updatePurchaseOrder(id: number, data: POUpdatePayload): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.base}/${id}`, data);
  }

  /** GET /reports/purchase-orders/preview */
  getReportPreview(): Observable<ReportPreview> {
    return this.http.get<ReportPreview>(`${this.reportsBase}/purchase-orders/preview`);
  }
}
