export interface Contract {
  id?: number;
  contract_number: string;
  vendor_id: number;
  contract_title: string;
  start_date: string;
  end_date: string;
  contract_value: number;
  status?: string;
  terms_conditions?: string;
}