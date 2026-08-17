import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Minimal vendor info nested inside every PO response */
export interface VendorBrief {
  id: number;
  vendor_name: string;
  email: string;
}

/** Full PO object returned by GET /api/po/history and GET /api/po/vendor/:id */
export interface PurchaseOrder {
  id: number;
  po_id: string;
  vendor_id: number;
  vendor: VendorBrief;
  status: 'Pending' | 'Dispatched' | 'Delivered';
  amount: number | null;
  expected_delivery_date: string | null;
  created_at: string;
  updated_at: string | null;
}

/** Response shape from GET /api/po/summary */
export interface POSummary {
  total: number;
  pending: number;
  dispatched: number;
  delivered: number;
}

/** Optional query params accepted by GET /api/po/history */
export interface POFilterParams {
  status?: 'Pending' | 'Dispatched' | 'Delivered' | null;
  start_date?: string | null;   // YYYY-MM-DD
  end_date?: string | null;     // YYYY-MM-DD
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PoService {
  private readonly base = 'http://127.0.0.1:8000/api/po';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/po/history
   * Returns all POs. All filter params are optional.
   */
  getPOHistory(filters: POFilterParams = {}): Observable<PurchaseOrder[]> {
    let params = new HttpParams();
    if (filters.status)     params = params.set('status',     filters.status);
    if (filters.start_date) params = params.set('start_date', filters.start_date);
    if (filters.end_date)   params = params.set('end_date',   filters.end_date);
    return this.http.get<PurchaseOrder[]>(`${this.base}/history`, { params });
  }

  /**
   * GET /api/po/vendor/:vendorId
   * Returns all POs for a specific vendor. 404 if vendor not found.
   */
  getPOsByVendor(vendorId: number): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.base}/vendor/${vendorId}`);
  }

  /**
   * GET /api/po/summary
   * Returns dashboard summary counts.
   */
  getPOSummary(): Observable<POSummary> {
    return this.http.get<POSummary>(`${this.base}/summary`);
  }
}
