export interface Procurement {

  id?: number;

  request_number: string;

  title: string;

  description?: string;

  vendor_id: number;

  requested_by: string;

  approved_by?: string;

  request_date: string;

  expected_delivery?: string;

  total_amount: number;

  status?: string;

  invoice_number?: string;

  remarks?: string;

}