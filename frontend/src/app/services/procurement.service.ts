import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcurementService {

  private apiUrl = 'http://127.0.0.1:8000/procurements/';

  constructor(private http: HttpClient) {}

  getProcurements(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createProcurement(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}${id}/status?status=${encodeURIComponent(status)}`,
      {}
    );
  }
  updateProcurement(id: number, data: any): Observable<any> {
  return this.http.put<any>(
    `${this.apiUrl}${id}`,
    data
  );
}

  deleteProcurement(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}${id}`
    );
  }
}