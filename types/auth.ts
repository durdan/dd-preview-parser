export interface User {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface Session {
  user: User;
  token: string;
  expiresAt: number;
}

export interface RouteConfig {
  path: string;
  requiresAuth: boolean;
  allowedRoles?: string[];
  allowedPermissions?: string[];
}

export interface AuthRequest extends Request {
  user?: User;
  session?: Session;
}