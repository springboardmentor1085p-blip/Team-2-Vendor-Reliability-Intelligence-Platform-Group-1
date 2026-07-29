export interface PurchaseOrder {

  id?: number;

  po_number: string;

  procurement_id: number;

  vendor_id: number;

  order_date: string;

  expected_delivery?: string;

  total_amount: number;

  status?: string;

  payment_status?: string;

  remarks?: string;

}