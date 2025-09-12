import { RouteConfig } from '@/types/auth';

export const ROUTE_CONFIGS: RouteConfig[] = [
  // Public routes
  { path: '/', requiresAuth: false },
  { path: '/login', requiresAuth: false },
  { path: '/register', requiresAuth: false },
  { path: '/api/auth/login', requiresAuth: false },
  { path: '/api/auth/register', requiresAuth: false },

  // Protected routes
  { path: '/dashboard', requiresAuth: true },
  { path: '/profile', requiresAuth: true },
  { path: '/api/user', requiresAuth: true },

  // Admin routes
  { 
    path: '/admin', 
    requiresAuth: true, 
    allowedRoles: ['admin', 'super_admin'] 
  },
  { 
    path: '/api/admin', 
    requiresAuth: true, 
    allowedRoles: ['admin', 'super_admin'] 
  },

  // Manager routes
  { 
    path: '/manage', 
    requiresAuth: true, 
    allowedRoles: ['manager', 'admin', 'super_admin'] 
  },

  // Permission-based routes
  { 
    path: '/api/reports', 
    requiresAuth: true, 
    allowedPermissions: ['read:reports', 'admin:all'] 
  }
];

export function findRouteConfig(pathname: string): RouteConfig | null {
  // Find exact match first
  const exactMatch = ROUTE_CONFIGS.find(config => config.path === pathname);
  if (exactMatch) return exactMatch;

  // Find pattern match (for dynamic routes)
  const patternMatch = ROUTE_CONFIGS.find(config => {
    if (config.path.includes('*')) {
      const pattern = config.path.replace('*', '');
      return pathname.startsWith(pattern);
    }
    return pathname.startsWith(config.path + '/');
  });

  return patternMatch || null;
}