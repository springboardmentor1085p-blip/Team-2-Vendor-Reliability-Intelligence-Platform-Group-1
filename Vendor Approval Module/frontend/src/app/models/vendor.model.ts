export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type VendorCategory =
  | 'raw_material_supplier'
  | 'equipment_vendor'
  | 'it_vendor'
  | 'service_provider'
  | 'logistics_partner'
  | 'maintenance_vendor';

export interface StatusHistory {
  id: number;
  old_status: VendorStatus | null;
  new_status: VendorStatus;
  changed_by: number;
  changed_by_name: string | null;
  remarks: string | null;
  changed_at: string;
}

export interface Vendor {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string | null;
  address: string | null;
  category: VendorCategory;
  status: VendorStatus;
  description: string | null;
  registration_number: string | null;
  tax_id: string | null;
  registered_by: number | null;
  reviewed_by: number | null;
  created_at: string;
  updated_at: string;
  status_history: StatusHistory[];
}

export interface VendorListItem {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  category: VendorCategory;
  status: VendorStatus;
  created_at: string;
}

export interface VendorStatusUpdate {
  status: VendorStatus;
  remarks?: string;
}
