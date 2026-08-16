import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://127.0.0.1:8000/messages';

  constructor(private http: HttpClient) {}

  getMessages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  sendMessage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, data);
  }
}