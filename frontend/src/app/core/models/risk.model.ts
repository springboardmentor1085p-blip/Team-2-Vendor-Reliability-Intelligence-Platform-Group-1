export interface Risk {
  id?: number;
  vendor_id: number;

  risk_level: string;
  risk_score: number;

  severity: string;
  impact_score: number;
  status: string;

  risk_type?: string;
  description?: string;
  issue: string;
  mitigation_plan?: string;

  created_at?: string;
  updated_at?: string;
}
