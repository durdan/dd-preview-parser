import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { createToken } from '../lib/jwt';

// Mock environment
process.env.JWT_SECRET = 'test-secret-key';

describe('Middleware', () => {
  const createRequest = (pathname: string, headers: Record<string, string> = {}) => {
    return new NextRequest(`http://localhost:3000${pathname}`, {
      headers: new Headers(headers)
    });
  };

  it('should allow public routes without token', async () => {
    const request = createRequest('/login');
    const response = await middleware(request);
    
    expect(response.status).toBe(200);
  });

  it('should redirect to login for protected routes without token', async () => {
    const request = createRequest('/dashboard');
    const response = await middleware(request);
    
    expect(response.status).toBe(307); // Redirect status
    expect(response.headers.get('location')).toContain('/login');
  });

  it('should return 401 for API routes without token', async () => {
    const request = createRequest('/api/protected/users');
    const response = await middleware(request);
    
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should allow protected routes with valid token', async () => {
    const token = await createToken({ userId: '123', email: 'test@example.com' });
    const request = createRequest('/dashboard', {
      'authorization': `Bearer ${token}`
    });
    
    const response = await middleware(request);
    expect(response.status).toBe(200);
  });

  it('should reject protected routes with invalid token', async () => {
    const request = createRequest('/dashboard', {
      'authorization': 'Bearer invalid-token'
    });
    
    const response = await middleware(request);
    expect(response.status).toBe(307); // Redirect to login
  });

  it('should skip middleware for static files', async () => {
    const request = createRequest('/_next/static/css/app.css');
    const response = await middleware(request);
    
    expect(response.status).toBe(200);
  });
});