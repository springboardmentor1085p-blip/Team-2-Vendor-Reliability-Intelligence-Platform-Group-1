export interface Reliability {
  vendor_id: number;

  delivery_score: number;
  quality_score: number;
  compliance_score: number;
  communication_score: number;
  risk_score: number;

  overall_reliability_score: number;
  risk_level: string;
  recommendations: string[];
}
