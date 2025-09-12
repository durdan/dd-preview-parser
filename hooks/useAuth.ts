import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const user = await response.json();
        setAuthState({ user, isLoading: false, error: null });
      } else {
        setAuthState({ user: null, isLoading: false, error: null });
      }
    } catch (error) {
      setAuthState({ 
        user: null, 
        isLoading: false, 
        error: 'Failed to check authentication status' 
      });
    }
  };

  return authState;
}