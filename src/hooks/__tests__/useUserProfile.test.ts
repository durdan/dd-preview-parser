import { renderHook, act } from '@testing-library/react';
import { useUserProfile } from '../useUserProfile';
import { User } from '../../types/User';

describe('useUserProfile', () => {
  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    isActive: true,
  };

  test('initializes with provided user', () => {
    const { result } = renderHook(() => useUserProfile(mockUser));
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('validates required fields', () => {
    const { result } = renderHook(() => useUserProfile());
    
    act(() => {
      result.current.updateUser({ name: '', email: 'test@example.com', age: '25' });
    });

    expect(result.current.error).toBe('Name is required');
  });

  test('validates email format', () => {
    const { result } = renderHook(() => useUserProfile());
    
    act(() => {
      result.current.updateUser({ name: 'John', email: 'invalid-email', age: '25' });
    });

    expect(result.current.error).toBe('Invalid email format');
  });

  test('validates age range', () => {
    const { result } = renderHook(() => useUserProfile());
    
    act(() => {
      result.current.updateUser({ name: 'John', email: 'john@example.com', age: '200' });
    });

    expect(result.current.error).toBe('Age must be between 0 and 150');
  });

  test('toggles active status', () => {
    const { result } = renderHook(() => useUserProfile(mockUser));
    
    act(() => {
      result.current.toggleActiveStatus();
    });

    expect(result.current.user?.isActive).toBe(false);
  });

  test('clears error', () => {
    const { result } = renderHook(() => useUserProfile());
    
    act(() => {
      result.current.updateUser({ name: '', email: 'test@example.com', age: '25' });
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });
});