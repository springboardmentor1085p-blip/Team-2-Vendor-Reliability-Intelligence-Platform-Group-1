import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private apiUrl = 'http://127.0.0.1:8000/analytics';

  constructor(private http: HttpClient) {}

  getAnalytics() {
    return this.http.get(this.apiUrl);
  }
}