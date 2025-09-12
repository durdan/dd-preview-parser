import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request) {
  // Only protect API routes that need authentication
  if (request.nextUrl.pathname.startsWith('/api/auth/profile')) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/profile']
};