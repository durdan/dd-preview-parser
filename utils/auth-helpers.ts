import { NextRequest } from 'next/server';
import { User } from '@/types/auth';

export function getUserFromHeaders(request: NextRequest): User | null {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userRoles = request.headers.get('x-user-roles');
  const userPermissions = request.headers.get('x-user-permissions');

  if (!userId || !userEmail || !userRoles) {
    return null;
  }

  try {
    return {
      id: userId,
      email: userEmail,
      roles: JSON.parse(userRoles),
      permissions: userPermissions ? JSON.parse(userPermissions) : []
    };
  } catch (error) {
    console.error('Error parsing user from headers:', error);
    return null;
  }
}

export function requireAuth(handler: (request: NextRequest, user: User) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = getUserFromHeaders(request);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return handler(request, user);
  };
}

export function requireRole(roles: string[], handler: (request: NextRequest, user: User) => Promise<Response>) {
  return requireAuth(async (request: NextRequest, user: User) => {
    if (!roles.some(role => user.roles.includes(role))) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return handler(request, user);
  });
}