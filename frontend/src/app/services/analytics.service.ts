import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private api = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  getStatusDistribution() {
    return this.http.get<any>(
      `${this.api}/analytics/status-distribution`
    );
  }

  getVendorReliability() {
    return this.http.get<any[]>(
      `${this.api}/analytics/vendor-reliability`
    );
  }

  getOrdersByStatus(status: string) {
    return this.http.get<any[]>(
      `${this.api}/analytics/orders-by-status/${status}`
    );
  }

  getOrdersByVendor(vendor: string) {
    return this.http.get<any[]>(
      `${this.api}/analytics/orders-by-vendor/${vendor}`
    );
  }

}