import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, extractTokenFromCookie } from './lib/jwt';
import { isProtectedRoute, isPublicRoute, authConfig } from './lib/auth-config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if route needs protection
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Extract token from Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');
  
  const token = extractTokenFromHeader(authHeader) || extractTokenFromCookie(cookieHeader);

  if (!token) {
    return handleUnauthorized(request, 'No token provided');
  }

  try {
    const payload = await verifyToken(token);
    
    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return handleUnauthorized(request, 'Invalid token');
  }
}

function handleUnauthorized(request: NextRequest, reason: string) {
  const { pathname } = request.nextUrl;
  
  // For API routes, return JSON error
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Unauthorized', reason },
      { status: 401 }
    );
  }
  
  // For page routes, redirect to login
  const loginUrl = new URL(authConfig.loginPath, request.url);
  loginUrl.searchParams.set('redirect', pathname);
  
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};