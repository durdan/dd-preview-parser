import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest, hasRole, hasPermission, AuthError } from '@/lib/auth';
import { findRouteConfig } from '@/config/routes';
import { User } from '@/types/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_next/') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  try {
    const routeConfig = findRouteConfig(pathname);
    
    // If no route config found, allow access (default behavior)
    if (!routeConfig) {
      return NextResponse.next();
    }

    // Public routes - no authentication required
    if (!routeConfig.requiresAuth) {
      return NextResponse.next();
    }

    // Extract and verify token
    const token = extractTokenFromRequest(request);
    if (!token) {
      return redirectToLogin(request);
    }

    let user: User;
    try {
      user = await verifyToken(token);
    } catch (error) {
      return redirectToLogin(request);
    }

    // Check role-based access
    if (routeConfig.allowedRoles && routeConfig.allowedRoles.length > 0) {
      if (!hasRole(user, routeConfig.allowedRoles)) {
        return createForbiddenResponse();
      }
    }

    // Check permission-based access
    if (routeConfig.allowedPermissions && routeConfig.allowedPermissions.length > 0) {
      if (!hasPermission(user, routeConfig.allowedPermissions)) {
        return createForbiddenResponse();
      }
    }

    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-roles', JSON.stringify(user.roles));
    requestHeaders.set('x-user-permissions', JSON.stringify(user.permissions));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Middleware error:', error);
    
    if (error instanceof AuthError) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      return redirectToLogin(request);
    }

    // For unexpected errors, return 500
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.redirect(new URL('/error', request.url));
  }
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function createForbiddenResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Insufficient permissions' },
    { status: 403 }
  );
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