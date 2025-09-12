import { findRouteConfig } from '@/config/routes';

describe('Route configuration', () => {
  it('should find exact route matches', () => {
    const config = findRouteConfig('/dashboard');
    expect(config).toBeTruthy();
    expect(config?.requiresAuth).toBe(true);
  });

  it('should find admin route with role requirements', () => {
    const config = findRouteConfig('/admin');
    expect(config?.allowedRoles).toContain('admin');
  });

  it('should return null for unknown routes', () => {
    const config = findRouteConfig('/unknown-route');
    expect(config).toBeNull();
  });

  it('should find pattern matches for nested routes', () => {
    const config = findRouteConfig('/admin/users');
    expect(config?.allowedRoles).toContain('admin');
  });
});