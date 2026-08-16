import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  private api = 'http://127.0.0.1:8000/preferences';

  constructor(private http: HttpClient) {}

  getPreferences(id: number) {
    return this.http.get(this.api + '/' + id);
  }

  updatePreferences(id: number, data: any) {
    return this.http.put(this.api + '/' + id, data);
  }
}