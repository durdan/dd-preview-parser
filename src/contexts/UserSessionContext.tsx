import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, UserSessionContextValue } from '../types/auth';

// Auth reducer
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

// Create context
const UserSessionContext = createContext<UserSessionContextValue | undefined>(undefined);

// Auth service helpers
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

const saveAuthData = (token: string, user: User): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

const getStoredAuthData = (): { token: string | null; user: User | null } => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userData = localStorage.getItem(USER_DATA_KEY);
  
  return {
    token,
    user: userData ? JSON.parse(userData) : null,
  };
};

const clearAuthData = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

// Mock authentication service
const authenticateUser = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  // Mock successful authentication
  return {
    token: `mock_token_${Date.now()}`,
    user: {
      id: '1',
      email,
      name: email.split('@')[0],
    },
  };
};

// Provider component
interface UserSessionProviderProps {
  children: ReactNode;
}

export const UserSessionProvider: React.FC<UserSessionProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { token, user } = await authenticateUser(email, password);
      saveAuthData(token, user);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = (): void => {
    clearAuthData();
    dispatch({ type: 'LOGOUT' });
  };

  const checkSession = (): void => {
    const { token, user } = getStoredAuthData();
    
    if (token && user) {
      dispatch({ type: 'SET_USER', payload: user });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const contextValue: UserSessionContextValue = {
    ...state,
    login,
    logout,
    checkSession,
  };

  return (
    <UserSessionContext.Provider value={contextValue}>
      {children}
    </UserSessionContext.Provider>
  );
};

// Custom hook
export const useUserSession = (): UserSessionContextValue => {
  const context = useContext(UserSessionContext);
  
  if (context === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  
  return context;
};