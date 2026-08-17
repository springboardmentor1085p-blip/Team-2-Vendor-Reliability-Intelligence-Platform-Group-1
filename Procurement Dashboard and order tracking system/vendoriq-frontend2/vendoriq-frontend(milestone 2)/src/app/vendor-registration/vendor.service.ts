import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Shape of the request body sent to POST /vendors */
export interface VendorPayload {
  vendorName: string;
  email: string;
  phone: string | null;
  address: string | null;
}

/** Shape of the request body sent to PUT /vendors/{id} — all fields optional */
export interface VendorUpdatePayload {
  vendorName?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
}

/** Shape of the response returned by the API for any vendor endpoint */
export interface VendorResponse {
  id: number;
  vendorName: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly apiUrl = 'http://127.0.0.1:8000/vendors';

  constructor(private http: HttpClient) {}

  registerVendor(vendorData: VendorPayload): Observable<VendorResponse> {
    return this.http.post<VendorResponse>(this.apiUrl, vendorData);
  }

  getVendors(skip = 0, limit = 100): Observable<VendorResponse[]> {
    return this.http.get<VendorResponse[]>(this.apiUrl, {
      params: { skip: skip.toString(), limit: limit.toString() }
    });
  }

  getVendorById(id: number): Observable<VendorResponse> {
    return this.http.get<VendorResponse>(`${this.apiUrl}/${id}`);
  }

  updateVendor(id: number, vendorData: VendorUpdatePayload): Observable<VendorResponse> {
    return this.http.put<VendorResponse>(`${this.apiUrl}/${id}`, vendorData);
  }

  deleteVendor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
