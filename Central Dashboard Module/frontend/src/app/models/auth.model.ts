export interface LoginRequest {
  username: string;   // OAuth2PasswordRequestForm uses 'username'
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  role: string;
  full_name: string;
}

export interface UserOut {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
}

export type UserRole =
  | 'administrator'
  | 'procurement_manager'
  | 'supply_chain_manager'
  | 'vendor'
  | 'finance_officer'
  | 'auditor';
