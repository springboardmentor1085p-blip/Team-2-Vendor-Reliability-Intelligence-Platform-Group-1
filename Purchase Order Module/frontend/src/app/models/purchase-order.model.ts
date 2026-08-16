export type POStatus =
  | 'Pending' | 'Approved' | 'Dispatched'
  | 'Delivered' | 'Completed' | 'Cancelled';

export type POPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface VendorBrief { id: number; vendor_code: string; company_name: string; }
export interface UserBrief   { id: number; full_name: string;  email: string; }

export interface POItem {
  id: number; item_code: string | null; item_name: string;
  description: string | null; quantity: number; unit: string;
  unit_price: number; total_price: number; notes: string | null;
}

export interface POItemCreate {
  item_code?: string; item_name: string; description?: string;
  quantity: number; unit: string; unit_price: number; notes?: string;
}

export interface POStatusHistory {
  id: number; previous_status: POStatus | null; new_status: POStatus;
  remarks: string | null; changed_at: string; changed_by: number | null;
}

export interface PurchaseOrder {
  id: number; po_number: string; vendor_id: number; vendor: VendorBrief;
  created_by: number; created_by_user: UserBrief;
  approved_by: number | null; approved_by_user: UserBrief | null;
  title: string; description: string | null;
  priority: POPriority; status: POStatus;
  subtotal: number; tax_rate: number; tax_amount: number;
  discount_amount: number; total_amount: number; currency: string;
  required_date: string | null; expected_delivery_date: string | null;
  actual_delivery_date: string | null; approved_at: string | null;
  dispatched_at: string | null; delivered_at: string | null;
  delivery_address: string | null; shipping_method: string | null;
  tracking_number: string | null; internal_notes: string | null;
  vendor_notes: string | null; created_at: string; updated_at: string | null;
  items: POItem[]; status_history: POStatusHistory[];
}

export interface PurchaseOrderListItem {
  id: number; po_number: string; vendor: VendorBrief; title: string;
  priority: POPriority; status: POStatus; total_amount: number; currency: string;
  required_date: string | null; expected_delivery_date: string | null; created_at: string;
}

export interface PurchaseOrderCreate {
  vendor_id: number; title: string; description?: string;
  priority: POPriority; tax_rate: number; discount_amount: number; currency: string;
  required_date?: string; expected_delivery_date?: string;
  delivery_address?: string; shipping_method?: string;
  internal_notes?: string; vendor_notes?: string;
  items: POItemCreate[];
}

export interface POStatusUpdate {
  status: POStatus; remarks?: string;
  tracking_number?: string; actual_delivery_date?: string;
}

export interface POSummaryStats {
  total_orders: number; pending: number; approved: number;
  dispatched: number; delivered: number; completed: number; cancelled: number;
  total_value: number; this_month_orders: number; this_month_value: number;
}

export interface POListResponse {
  items: PurchaseOrderListItem[]; total: number; skip: number; limit: number;
}
