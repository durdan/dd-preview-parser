import { jwtVerify, SignJWT } from 'jose';
import { User, Session } from '@/types/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function verifyToken(token: string): Promise<User> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (!payload.sub || !payload.email || !payload.roles) {
      throw new AuthError('Invalid token payload');
    }

    return {
      id: payload.sub as string,
      email: payload.email as string,
      roles: payload.roles as string[],
      permissions: payload.permissions as string[] || []
    };
  } catch (error) {
    throw new AuthError('Invalid or expired token');
  }
}

export async function createToken(user: User): Promise<string> {
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    roles: user.roles,
    permissions: user.permissions
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export function hasRole(user: User, requiredRoles: string[]): boolean {
  return requiredRoles.some(role => user.roles.includes(role));
}

export function hasPermission(user: User, requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => 
    user.permissions.includes(permission)
  );
}

export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check for token in cookies (for browser requests)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const tokenMatch = cookieHeader.match(/auth-token=([^;]+)/);
    return tokenMatch ? tokenMatch[1] : null;
  }

  return null;
}