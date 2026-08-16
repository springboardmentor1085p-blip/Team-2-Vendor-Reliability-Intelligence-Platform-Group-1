export type UserRole =
  | 'Administrator'
  | 'Procurement Manager'
  | 'Supply Chain Manager'
  | 'Vendor'
  | 'Finance Officer'
  | 'Auditor';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
