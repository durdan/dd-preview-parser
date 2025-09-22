import { useState, useCallback } from 'react';
import { User, UserFormData } from '../types/User';

interface UseUserProfileReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateUser: (formData: UserFormData) => void;
  toggleActiveStatus: () => void;
  clearError: () => void;
}

export const useUserProfile = (initialUser?: User): UseUserProfileReturn => {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUserData = (formData: UserFormData): string | null => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email format';
    
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 0 || age > 150) return 'Age must be between 0 and 150';
    
    return null;
  };

  const updateUser = useCallback((formData: UserFormData) => {
    setLoading(true);
    setError(null);

    const validationError = validateUserData(formData);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    // Simulate async operation
    setTimeout(() => {
      const updatedUser: User = {
        id: user?.id || crypto.randomUUID(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        age: parseInt(formData.age),
        isActive: user?.isActive ?? true,
      };
      
      setUser(updatedUser);
      setLoading(false);
    }, 500);
  }, [user]);

  const toggleActiveStatus = useCallback(() => {
    if (!user) return;
    
    setUser(prevUser => prevUser ? { ...prevUser, isActive: !prevUser.isActive } : null);
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    updateUser,
    toggleActiveStatus,
    clearError,
  };
};