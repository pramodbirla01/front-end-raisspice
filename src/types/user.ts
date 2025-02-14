export interface User {
  $id?: string;
  full_name: string;
  email: string;
  email_verified: boolean;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface RegisterUserData {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
