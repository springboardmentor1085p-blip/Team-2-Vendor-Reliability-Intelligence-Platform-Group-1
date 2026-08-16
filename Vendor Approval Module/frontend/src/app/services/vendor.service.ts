import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendor, VendorListItem, VendorStatus, VendorStatusUpdate } from '../models/vendor.model';

const API = 'http://localhost:8000/api/vendors';

@Injectable({ providedIn: 'root' })
export class VendorService {
  constructor(private http: HttpClient) {}

  getAll(status?: VendorStatus, category?: string): Observable<VendorListItem[]> {
    let params = new HttpParams();
    if (status)   params = params.set('status', status);
    if (category) params = params.set('category', category);
    return this.http.get<VendorListItem[]>(API, { params });
  }

  getPending(): Observable<VendorListItem[]> {
    return this.http.get<VendorListItem[]>(`${API}/pending`);
  }

  getById(id: number): Observable<Vendor> {
    return this.http.get<Vendor>(`${API}/${id}`);
  }

  /**
   * MEMBER B CORE: Change vendor status.
   * Backend enforces that only managers/admins can call this.
   */
  updateStatus(id: number, payload: VendorStatusUpdate): Observable<Vendor> {
    return this.http.patch<Vendor>(`${API}/${id}/status`, payload);
  }

  approve(id: number, remarks?: string): Observable<Vendor> {
    return this.updateStatus(id, { status: 'approved', remarks });
  }

  reject(id: number, remarks?: string): Observable<Vendor> {
    return this.updateStatus(id, { status: 'rejected', remarks });
  }

  suspend(id: number, remarks?: string): Observable<Vendor> {
    return this.updateStatus(id, { status: 'suspended', remarks });
  }
}
