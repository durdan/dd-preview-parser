const DiagramService = require('../src/services/DiagramService');

describe('DiagramService', () => {
  let service;

  beforeEach(() => {
    service = new DiagramService();
  });

  test('should validate and render valid diagram', async () => {
    const diagramCode = `
      graph TD
        A[Start] --> B[End]
    `;

    const result = await service.renderDiagram(diagramCode);

    expect(result.success).toBe(true);
    expect(result.svg).toContain('<svg');
    expect(result.diagramType).toBe('graph');
  });

  test('should return errors for invalid diagram', async () => {
    const diagramCode = 'invalid syntax';

    const result = await service.renderDiagram(diagramCode);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should return available themes', () => {
    const themes = service.getAvailableThemes();

    expect(Array.isArray(themes)).toBe(true);
    expect(themes).toContain('default');
    expect(themes).toContain('dark');
  });
});