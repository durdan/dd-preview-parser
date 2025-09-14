const DiagramAuthService = require('../src/auth/DiagramAuthService');
const SessionContext = require('../src/auth/SessionContext');
const UserDiagram = require('../src/models/UserDiagram');

describe('DiagramAuthService', () => {
  let authService;
  let sessionContext;
  const user = { id: 'user1', name: 'John' };

  beforeEach(() => {
    sessionContext = new SessionContext();
    authService = new DiagramAuthService(sessionContext);
  });

  test('should deny diagram creation for unauthenticated users', () => {
    expect(authService.canCreateDiagram()).toBe(false);
  });

  test('should allow diagram creation for authenticated users', () => {
    sessionContext.setUser(user);
    expect(authService.canCreateDiagram()).toBe(true);
  });

  test('should check diagram access permissions', () => {
    const diagram = new UserDiagram('d1', 'Test', 'content', 'user1');
    
    expect(authService.canAccessDiagram(diagram)).toBe(false);
    
    sessionContext.setUser(user);
    expect(authService.canAccessDiagram(diagram)).toBe(true);
  });

  test('should require diagram access', () => {
    const diagram = new UserDiagram('d1', 'Test', 'content', 'user1');
    
    expect(() => authService.requireDiagramAccess(diagram))
      .toThrow('Access denied: insufficient permissions');
    
    sessionContext.setUser(user);
    expect(() => authService.requireDiagramAccess(diagram)).not.toThrow();
  });
});