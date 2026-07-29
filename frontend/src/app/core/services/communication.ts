import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Communication } from '../models/communication.model';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/communications';

  getAllCommunications(): Observable<Communication[]> {
    return this.http.get<Communication[]>(this.apiUrl);
  }

  getCommunicationById(id: number): Observable<Communication> {
    return this.http.get<Communication>(`${this.apiUrl}/${id}`);
  }

  createCommunication(data: Communication): Observable<Communication> {
    return this.http.post<Communication>(this.apiUrl, data);
  }

  updateCommunication(id: number, data: Communication): Observable<Communication> {
    return this.http.put<Communication>(`${this.apiUrl}/${id}`, data);
  }

  deleteCommunication(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}