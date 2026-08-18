import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Reliability } from '../models/reliability.model';

@Injectable({
  providedIn: 'root'
})
export class ReliabilityService {

  private http = inject(HttpClient);

  private readonly API_URL =
    'http://127.0.0.1:8000/reliability';

  getVendorReliability(
    vendorId: number
  ): Observable<Reliability> {

    return this.http.get<Reliability>(
      `${this.API_URL}/${vendorId}`
    );
  }

}
