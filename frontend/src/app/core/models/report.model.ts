export interface Report {
  id?: number;
  report_name: string;
  report_type: string;
  generated_by: string;
  file_format: string;
  status?: string;
  created_at?: string;
}