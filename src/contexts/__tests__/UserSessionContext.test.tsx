import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserSessionProvider, useUserSession } from '../UserSessionContext';

// Test component that uses the context
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useUserSession();

  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user ? user.name : 'null'}</div>
      <button onClick={() => login('test@example.com', 'password123')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('UserSessionContext', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('should provide initial unauthenticated state', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <UserSessionProvider>
        <TestComponent />
      </UserSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('should handle successful login', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <UserSessionProvider>
        <TestComponent />
      </UserSessionProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'auth_token',
      expect.stringContaining('mock_token_')
    );
  });

  it('should handle logout', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <UserSessionProvider>
        <TestComponent />
      </UserSessionProvider>
    );

    // Login first
    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    // Then logout
    fireEvent.click(screen.getByText('Logout'));

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
  });

  it('should restore session from localStorage', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'test' };
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_token') return 'mock_token';
      if (key === 'user_data') return JSON.stringify(mockUser);
      return null;
    });

    render(
      <UserSessionProvider>
        <TestComponent />
      </UserSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test');
  });

  it('should throw error when used outside provider', () => {
    const TestComponentOutsideProvider = () => {
      useUserSession();
      return null;
    };

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow('useUserSession must be used within a UserSessionProvider');
  });
});