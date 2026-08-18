export type PurchaseOrderStatus =
  'draft' | 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentStatus =
  'pending' | 'partial' | 'paid' | 'overdue' | 'refunded';

export interface PurchaseOrder {
  id: number;
  procurement_id?: number;
  po_number: string;
  vendor_id: number;
  amount: number;
  total_amount?: number;
  order_date: string;
  expected_delivery_date?: string | null;
  status: PurchaseOrderStatus;
  payment_status: PaymentStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  vendor?: {
    id: number;
  procurement_id?: number;
    company_name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
  };
}

export interface CreatePurchaseOrderDto {
  po_number: string;
  vendor_id: number;
  amount: number;
  total_amount?: number;
  order_date: string;
  expected_delivery_date?: string | null;
  status: PurchaseOrderStatus;
  payment_status: PaymentStatus;
  notes?: string | null;
}

export type UpdatePurchaseOrderDto =
  Partial<CreatePurchaseOrderDto>;
