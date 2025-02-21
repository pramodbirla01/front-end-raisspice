export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  email_verified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  error?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: boolean;
  customerId?: string;  // Add this to match the token structure
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}
