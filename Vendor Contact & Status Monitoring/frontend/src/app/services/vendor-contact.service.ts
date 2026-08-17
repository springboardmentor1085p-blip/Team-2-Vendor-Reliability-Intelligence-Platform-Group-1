import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VendorContact, VendorProfile, VendorStatus } from '../models/vendor-contact.model';

@Injectable({ providedIn: 'root' })
export class VendorContactService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  getVendorProfile(vendorId: number): Observable<VendorProfile> {
    return this.http.get<VendorProfile>(`${this.baseUrl}/vendors/${vendorId}/profile`);
  }

  getVendorStatus(vendorId: number): Observable<VendorStatus> {
    return this.http.get<VendorStatus>(`${this.baseUrl}/vendors/${vendorId}/status`);
  }

  getContacts(vendorId: number): Observable<VendorContact[]> {
    return this.http.get<VendorContact[]>(`${this.baseUrl}/vendors/${vendorId}/contacts`);
  }

  addContact(vendorId: number, payload: Partial<VendorContact>): Observable<VendorContact> {
    return this.http.post<VendorContact>(`${this.baseUrl}/vendors/${vendorId}/contacts`, payload);
  }

  updateContact(contactId: number, payload: Partial<VendorContact>): Observable<VendorContact> {
    return this.http.put<VendorContact>(`${this.baseUrl}/contacts/${contactId}`, payload);
  }

  deleteContact(contactId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/contacts/${contactId}`);
  }
}
