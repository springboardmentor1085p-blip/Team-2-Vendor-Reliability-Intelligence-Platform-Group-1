import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Report } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/reports';

  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }

  getReportById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`);
  }

  createReport(report: Report): Observable<Report> {
    return this.http.post<Report>(this.apiUrl, report);
  }

  updateReport(id: number, report: Report): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${id}`, report);
  }

  deleteReport(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}