const SessionContext = require('../src/auth/SessionContext');

describe('SessionContext', () => {
  let sessionContext;

  beforeEach(() => {
    sessionContext = new SessionContext();
  });

  test('should set and get current user', () => {
    const user = { id: 'user1', name: 'John' };
    sessionContext.setUser(user);
    
    expect(sessionContext.getCurrentUser()).toEqual(user);
    expect(sessionContext.isAuthenticated()).toBe(true);
  });

  test('should reject invalid user', () => {
    expect(() => sessionContext.setUser(null)).toThrow('Invalid user object');
    expect(() => sessionContext.setUser({})).toThrow('Invalid user object');
  });

  test('should require authentication', () => {
    expect(() => sessionContext.requireAuthentication()).toThrow('Authentication required');
    
    const user = { id: 'user1', name: 'John' };
    sessionContext.setUser(user);
    expect(sessionContext.requireAuthentication()).toEqual(user);
  });

  test('should logout user', () => {
    const user = { id: 'user1', name: 'John' };
    sessionContext.setUser(user);
    sessionContext.logout();
    
    expect(sessionContext.getCurrentUser()).toBeNull();
    expect(sessionContext.isAuthenticated()).toBe(false);
  });
});