export interface Communication {
  id?: number;
  vendor_id: number;
  subject: string;
  message: string;
  communication_type: string;
  status?: string;
  communication_date?: string;
}