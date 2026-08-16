import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Vendor, VendorCreate, VendorListResponse } from '../models/vendor.model';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly base = `${environment.apiUrl}/vendors`;
  constructor(private http: HttpClient) {}

  list(opts?: { skip?: number; limit?: number; status?: string; search?: string }) {
    let p = new HttpParams();
    if (opts?.skip    != null) p = p.set('skip',          opts.skip);
    if (opts?.limit   != null) p = p.set('limit',         opts.limit);
    if (opts?.status)          p = p.set('status_filter', opts.status);
    if (opts?.search)          p = p.set('search',        opts.search);
    return this.http.get<VendorListResponse>(`${this.base}/`, { params: p });
  }

  getById(id: number) { return this.http.get<Vendor>(`${this.base}/${id}`); }
  create(data: VendorCreate) { return this.http.post<Vendor>(`${this.base}/`, data); }
  approve(id: number) { return this.http.post<Vendor>(`${this.base}/${id}/approve`, {}); }
  listApproved() { return this.list({ status: 'Approved', limit: 200 }); }
}
