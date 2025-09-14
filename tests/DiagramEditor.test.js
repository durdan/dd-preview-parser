const DiagramEditor = require('../src/DiagramEditor');
const SessionContext = require('../src/auth/SessionContext');
const DiagramRepository = require('../src/repositories/DiagramRepository');

describe('DiagramEditor with Authentication', () => {
  let editor;
  let sessionContext;
  let repository;
  const user1 = { id: 'user1', name: 'John' };
  const user2 = { id: 'user2', name: 'Jane' };

  beforeEach(() => {
    sessionContext = new SessionContext();
    repository = new DiagramRepository();
    editor = new DiagramEditor(sessionContext, repository);
  });

  test('should require authentication for creating diagrams', () => {
    expect(() => editor.createDiagram('d1', 'Test Diagram')).toThrow('Authentication required');
  });

  test('should create diagram for authenticated user', () => {
    sessionContext.setUser(user1);
    
    const diagram = editor.createDiagram('d1', 'Test Diagram', 'content');
    
    expect(diagram.id).toBe('d1');
    expect(diagram.name).toBe('Test Diagram');
    expect(diagram.ownerId).toBe('user1');
  });

  test('should only load diagrams owned by current user', () => {
    sessionContext.setUser(user1);
    editor.createDiagram('d1', 'User1 Diagram');
    
    sessionContext.setUser(user2);
    expect(() => editor.loadDiagram('d1')).toThrow('not found or access denied');
  });

  test('should load own diagrams successfully', () => {
    sessionContext.setUser(user1);
    editor.createDiagram('d1', 'Test Diagram', 'content');
    
    const loaded = editor.loadDiagram('d1');
    expect(loaded.name).toBe('Test Diagram');
    expect(loaded.content).toBe('content');
  });

  test('should save diagram content with authorization', () => {
    sessionContext.setUser(user1);
    editor.createDiagram('d1', 'Test Diagram');
    
    const updated = editor.saveDiagram('new content');
    expect(updated.content).toBe('new content');
  });

  test('should list only user diagrams', () => {
    sessionContext.setUser(user1);
    editor.createDiagram('d1', 'User1 Diagram1');
    editor.createDiagram('d2', 'User1 Diagram2');
    
    sessionContext.setUser(user2);
    editor.createDiagram('d3', 'User2 Diagram');
    
    const user2Diagrams = editor.listUserDiagrams();
    expect(user2Diagrams).toHaveLength(1);
    expect(user2Diagrams[0].name).toBe('User2 Diagram');
  });

  test('should delete only own diagrams', () => {
    sessionContext.setUser(user1);
    editor.createDiagram('d1', 'User1 Diagram');
    
    sessionContext.setUser(user2);
    expect(() => editor.deleteDiagram('d1')).toThrow('not found or access denied');
    
    sessionContext.setUser(user1);
    expect(editor.deleteDiagram('d1')).toBe(true);
  });
});