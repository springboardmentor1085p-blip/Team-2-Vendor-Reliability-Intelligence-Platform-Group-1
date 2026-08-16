import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorAnalyticsService {

  private api = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  getVendorReliability(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/analytics/vendor-reliability`);
  }
  getHistoricalTrends(fromDate?: string, toDate?: string){

  return this.http.get<any[]>(
    'http://127.0.0.1:8000/analytics/historical-trends',
    {
      params: {
        from_date: fromDate || '',
        to_date: toDate || ''
      }
    }
  );
}

getAuditLogs() {
  return this.http.get<any[]>(`${this.api}/analytics/audit-logs`);
}

}