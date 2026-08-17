import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReliabilityService {

  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/reliability-score';

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  calculateScore(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/calculate`, data);
  }

  getHistory(vendorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/history/${vendorId}`);
  }

  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`);
  }

  markNotificationRead(id: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/notifications/${id}/read`,
      {}
    );
  }

  markAllRead(): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/notifications/read-all`,
      {}
    );
  }

  clearNotifications(): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/notifications`
    );
  }

  recalculateAll(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/recalculate-all`,
      {}
    );
  }

  getTopVendors(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/top-vendors`
    );
  }

  getHighRiskVendors(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/high-risk`
    );
  }
}