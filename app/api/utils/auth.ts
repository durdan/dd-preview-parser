import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function getCurrentUser(request: NextRequest): any {
  const token = extractToken(request);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(request: NextRequest): any {
  const user = getCurrentUser(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export function requireAdmin(request: NextRequest): any {
  const user = requireAuth(request);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}