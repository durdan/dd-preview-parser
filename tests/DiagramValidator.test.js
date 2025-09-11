const DiagramValidator = require('../src/validators/DiagramValidator');

describe('DiagramValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new DiagramValidator();
  });

  test('should validate valid flowchart diagram', async () => {
    const diagramCode = `
      flowchart TD
        A[Start] --> B[Process]
        B --> C[End]
    `;

    const result = await validator.validate(diagramCode);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.diagramType).toBe('flowchart');
  });

  test('should reject empty diagram code', async () => {
    const result = await validator.validate('');

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Diagram code cannot be empty');
  });

  test('should reject null diagram code', async () => {
    const result = await validator.validate(null);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Diagram code must be a non-empty string');
  });

  test('should reject invalid syntax', async () => {
    const diagramCode = 'invalid mermaid syntax here';

    const result = await validator.validate(diagramCode);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});