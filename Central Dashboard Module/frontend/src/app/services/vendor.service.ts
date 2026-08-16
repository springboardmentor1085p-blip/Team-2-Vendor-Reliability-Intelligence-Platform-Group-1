import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vendor, VendorDetail, VendorStats, VendorCreate } from '../models/vendor.model';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private base = `${environment.apiUrl}/vendors`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<VendorStats> {
    return this.http.get<VendorStats>(`${this.base}/stats`);
  }

  list(params?: {
    search?: string; category?: string; status?: string;
    skip?: number; limit?: number;
  }): Observable<Vendor[]> {
    let p = new HttpParams();
    if (params?.search)   p = p.set('search', params.search);
    if (params?.category) p = p.set('category', params.category);
    if (params?.status)   p = p.set('status', params.status);
    if (params?.skip)     p = p.set('skip', params.skip.toString());
    if (params?.limit)    p = p.set('limit', params.limit?.toString() ?? '100');
    return this.http.get<Vendor[]>(this.base, { params: p });
  }

  getById(id: number): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.base}/${id}`);
  }

  getDetail(id: number): Observable<VendorDetail> {
    return this.http.get<VendorDetail>(`${this.base}/${id}/detail`);
  }

  create(data: VendorCreate): Observable<Vendor> {
    return this.http.post<Vendor>(this.base, data);
  }

  update(id: number, data: Partial<VendorCreate>): Observable<Vendor> {
    return this.http.put<Vendor>(`${this.base}/${id}`, data);
  }

  approve(id: number): Observable<Vendor> {
    return this.http.post<Vendor>(`${this.base}/${id}/approve`, {});
  }

  suspend(id: number): Observable<Vendor> {
    return this.http.post<Vendor>(`${this.base}/${id}/suspend`, {});
  }

  reject(id: number): Observable<Vendor> {
    return this.http.post<Vendor>(`${this.base}/${id}/reject`, {});
  }

  recalculateScore(id: number): Observable<any> {
    return this.http.post(`${this.base}/${id}/recalculate-score`, {});
  }
}
