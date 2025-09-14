export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UserSessionContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkSession: () => void;
}