export type VendorCategory =
  | 'Raw Material Supplier'
  | 'Equipment Vendor'
  | 'IT Vendor'
  | 'Service Provider'
  | 'Logistics Partner'
  | 'Maintenance Vendor';

export type VendorStatus = 'Pending' | 'Approved' | 'Suspended' | 'Blacklisted';

export interface Vendor {
  id: number;
  vendor_code: string;
  company_name: string;
  contact_person: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  category: VendorCategory;
  status: VendorStatus;
  registration_number: string | null;
  tax_id: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
}

export interface VendorCreate {
  company_name: string;
  contact_person?: string;
  email: string;
  phone?: string;
  address?: string;
  category: VendorCategory;
  registration_number?: string;
  tax_id?: string;
  website?: string;
  notes?: string;
}

export interface VendorListResponse {
  items: Vendor[];
  total: number;
  skip: number;
  limit: number;
}
