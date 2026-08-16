export type VendorStatus   = 'pending'|'approved'|'suspended'|'rejected'|'inactive';
export type VendorCategory = 'raw_material'|'equipment'|'it'|'service'|'logistics'|'maintenance';

export interface Vendor {
  id: number; name: string; email: string;
  phone: string|null; address: string|null;
  category: VendorCategory; status: VendorStatus;
  contact_person: string|null; website: string|null;
  tax_id: string|null; reliability_score: number;
  created_at: string;
}

export interface VendorDetail extends Vendor {
  total_orders: number; total_spend: number;
  on_time_rate: number; total_deliveries: number;
  approved_by: number|null;
}

export interface VendorStats {
  total: number; approved: number; pending: number;
  suspended: number; rejected: number;
  by_category: Record<string, number>;
}

export interface VendorCreate {
  name: string; email: string;
  phone?: string; address?: string;
  category: VendorCategory;
  contact_person?: string; website?: string; tax_id?: string;
}

export const VENDOR_CATEGORIES = [
  { value: 'raw_material' as VendorCategory, label: 'Raw Material' },
  { value: 'equipment'    as VendorCategory, label: 'Equipment' },
  { value: 'it'           as VendorCategory, label: 'IT & Technology' },
  { value: 'service'      as VendorCategory, label: 'Service Provider' },
  { value: 'logistics'    as VendorCategory, label: 'Logistics' },
  { value: 'maintenance'  as VendorCategory, label: 'Maintenance' },
];

export const VENDOR_STATUSES = [
  { value: 'pending'   as VendorStatus, label: 'Pending' },
  { value: 'approved'  as VendorStatus, label: 'Approved' },
  { value: 'suspended' as VendorStatus, label: 'Suspended' },
  { value: 'rejected'  as VendorStatus, label: 'Rejected' },
  { value: 'inactive'  as VendorStatus, label: 'Inactive' },
];
