import handler from '../../pages/api/validate-diagram';
import { createMocks } from 'node-mocks-http';

describe('/api/validate-diagram', () => {
  test('validates correct flowchart diagram', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        diagram: 'flowchart TD\n    A[Start] --> B[End]',
        diagramType: 'flowchart'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.isValid).toBe(true);
    expect(data.errors).toHaveLength(0);
    expect(data.diagramType).toBe('flowchart');
  });

  test('detects syntax errors', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        diagram: 'flowchart TD\n    A[Start] --> [Invalid]',
        diagramType: 'flowchart'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.isValid).toBe(false);
    expect(data.errors.length).toBeGreaterThan(0);
    expect(data.errors[0]).toHaveProperty('type');
    expect(data.errors[0]).toHaveProperty('message');
  });

  test('rejects empty diagram', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        diagram: '',
        diagramType: 'flowchart'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.isValid).toBe(false);
    expect(data.errors[0].type).toBe('EMPTY_DIAGRAM');
  });

  test('handles invalid request method', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });

  test('validates request body', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        diagramType: 'flowchart'
        // missing diagram
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain('diagram content is required');
  });
});