export interface User {
  userId: string;
  email: string;
}

export interface AuthError {
  error: string;
  reason: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}