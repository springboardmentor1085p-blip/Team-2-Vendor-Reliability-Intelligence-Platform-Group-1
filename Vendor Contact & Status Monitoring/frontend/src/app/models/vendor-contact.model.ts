export interface VendorContact {
  id: number;
  vendor_id: number;
  contact_name: string;
  designation: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface VendorProfile {
  id: number;
  name: string;
  code: string;
  category?: string;
  status: string;
  reliability_score: number;
}

export interface VendorStatus {
  vendor_id: number;
  status: string;
  reliability_score: number;
  last_verified_at: string;
}
