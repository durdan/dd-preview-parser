export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface Diagram {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'flowchart' | 'sequence' | 'class';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
}