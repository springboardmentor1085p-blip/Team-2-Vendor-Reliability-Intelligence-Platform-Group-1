export type UserRole =
  | 'administrator'
  | 'procurement_manager'
  | 'supply_chain_manager'
  | 'vendor'
  | 'finance_officer'
  | 'auditor';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}
