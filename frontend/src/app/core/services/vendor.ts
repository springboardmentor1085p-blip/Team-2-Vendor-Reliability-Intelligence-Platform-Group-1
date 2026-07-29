import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Vendor } from '../models/vendor.model';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  private http = inject(HttpClient);

  private readonly API_URL = 'http://127.0.0.1:8000/vendors';

  // Get All Vendors
  getAllVendors(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(this.API_URL);
  }

  // Get Vendor By ID
  getVendorById(vendorId: number): Observable<Vendor> {
    return this.http.get<Vendor>(
      `${this.API_URL}/${vendorId}`
    );
  }

  // Create Vendor
  createVendor(vendor: Vendor): Observable<Vendor> {
    return this.http.post<Vendor>(
      this.API_URL,
      vendor
    );
  }

  // Update Vendor
  updateVendor(
    vendorId: number,
    vendor: Vendor
  ): Observable<Vendor> {

    return this.http.put<Vendor>(
      `${this.API_URL}/${vendorId}`,
      vendor
    );

  }

  // Delete Vendor
  deleteVendor(vendorId: number): Observable<any> {

    return this.http.delete(
      `${this.API_URL}/${vendorId}`
    );

  }

  // Pending Vendors
  getPendingVendors(): Observable<Vendor[]> {

    return this.http.get<Vendor[]>(
      `${this.API_URL}/pending`
    );

  }

  // Approve Vendor
  approveVendor(vendorId: number): Observable<any> {

    return this.http.put(
      `${this.API_URL}/${vendorId}/approve`,
      {}
    );

  }

  // Reject Vendor
  rejectVendor(vendorId: number): Observable<any> {

    return this.http.put(
      `${this.API_URL}/${vendorId}/reject`,
      {}
    );

  }

}