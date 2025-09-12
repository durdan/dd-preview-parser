import { DiagramParser } from '../DiagramParser';

describe('DiagramParser', () => {
  it('should accept empty content', () => {
    const result = DiagramParser.parse('');
    expect(result.isValid).toBe(true);
    expect(result.parsedContent).toBe('');
  });

  it('should accept valid mermaid flowchart', () => {
    const content = 'flowchart TD\n    A --> B';
    const result = DiagramParser.parse(content);
    expect(result.isValid).toBe(true);
    expect(result.parsedContent).toBe(content);
  });

  it('should accept valid mermaid sequence diagram', () => {
    const content = 'sequenceDiagram\n    Alice->>Bob: Hello';
    const result = DiagramParser.parse(content);
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid syntax', () => {
    const content = 'invalid diagram content';
    const result = DiagramParser.parse(content);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid diagram syntax');
  });

  it('should handle whitespace correctly', () => {
    const content = '  \n  flowchart TD\n    A --> B  \n  ';
    const result = DiagramParser.parse(content);
    expect(result.isValid).toBe(true);
    expect(result.parsedContent).toBe('flowchart TD\n    A --> B');
  });
});