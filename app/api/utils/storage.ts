import { User, Diagram, AuditLog } from '../types';

// In-memory storage (replace with database in production)
export const users: User[] = [];
export const diagrams: Diagram[] = [];
export const auditLogs: AuditLog[] = [];

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  const user: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date()
  };
  users.push(user);
  return user;
}

export function findDiagramsByUserId(userId: string): Diagram[] {
  return diagrams.filter(d => d.userId === userId);
}

export function findDiagramById(id: string): Diagram | undefined {
  return diagrams.find(d => d.id === id);
}

export function createDiagram(diagramData: Omit<Diagram, 'id' | 'createdAt' | 'updatedAt'>): Diagram {
  const diagram: Diagram = {
    ...diagramData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  diagrams.push(diagram);
  return diagram;
}

export function updateDiagram(id: string, updates: Partial<Diagram>): Diagram | null {
  const index = diagrams.findIndex(d => d.id === id);
  if (index === -1) return null;
  
  diagrams[index] = { ...diagrams[index], ...updates, updatedAt: new Date() };
  return diagrams[index];
}

export function deleteDiagram(id: string): boolean {
  const index = diagrams.findIndex(d => d.id === id);
  if (index === -1) return false;
  
  diagrams.splice(index, 1);
  return true;
}

export function logAudit(userId: string, action: string, resource: string): void {
  const log: AuditLog = {
    id: Date.now().toString(),
    userId,
    action,
    resource,
    timestamp: new Date()
  };
  auditLogs.push(log);
}