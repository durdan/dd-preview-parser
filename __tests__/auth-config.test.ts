import { isProtectedRoute, isPublicRoute } from '../lib/auth-config';

describe('Auth Config', () => {
  describe('isProtectedRoute', () => {
    it('should identify protected routes', () => {
      expect(isProtectedRoute('/dashboard')).toBe(true);
      expect(isProtectedRoute('/dashboard/settings')).toBe(true);
      expect(isProtectedRoute('/api/protected/users')).toBe(true);
    });

    it('should not identify unprotected routes', () => {
      expect(isProtectedRoute('/login')).toBe(false);
      expect(isProtectedRoute('/home')).toBe(false);
      expect(isProtectedRoute('/api/public')).toBe(false);
    });
  });

  describe('isPublicRoute', () => {
    it('should identify public routes', () => {
      expect(isPublicRoute('/login')).toBe(true);
      expect(isPublicRoute('/register')).toBe(true);
      expect(isPublicRoute('/api/auth/login')).toBe(true);
    });

    it('should not identify non-public routes', () => {
      expect(isPublicRoute('/dashboard')).toBe(false);
      expect(isPublicRoute('/api/protected')).toBe(false);
    });
  });
});