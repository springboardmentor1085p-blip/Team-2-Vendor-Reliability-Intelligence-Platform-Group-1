import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class IntegrationService {
  private apiBase = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getIntegrationSummary(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiBase}/integration`);
  }
}
