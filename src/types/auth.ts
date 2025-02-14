export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  email_verified: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}
