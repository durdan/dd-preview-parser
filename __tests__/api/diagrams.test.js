import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/diagrams/index';
import connectDB from '../../lib/mongodb';
import Diagram from '../../models/Diagram';

// Mock the database connection
jest.mock('../../lib/mongodb');
jest.mock('../../models/Diagram');

describe('/api/diagrams', () => {
  beforeEach(() => {
    connectDB.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/diagrams', () => {
    it('should return all diagrams', async () => {
      const mockDiagrams = [
        { _id: '1', name: 'Test Diagram', content: { nodes: [] } },
        { _id: '2', name: 'Another Diagram', content: { nodes: [] } }
      ];

      Diagram.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockDiagrams)
      });

      const { req, res } = createMocks({ method: 'GET' });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDiagrams);
      expect(data.count).toBe(2);
    });
  });

  describe('POST /api/diagrams', () => {
    it('should create a new diagram', async () => {
      const newDiagram = {
        name: 'New Diagram',
        description: 'Test description',
        content: { nodes: [], edges: [] }
      };

      const createdDiagram = { _id: '123', ...newDiagram };
      Diagram.create.mockResolvedValue(createdDiagram);

      const { req, res } = createMocks({
        method: 'POST',
        body: newDiagram
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toEqual(createdDiagram);
    });

    it('should return validation error for missing name', async () => {
      const invalidDiagram = {
        description: 'Test description',
        content: { nodes: [] }
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: invalidDiagram
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
    });
  });

  describe('Unsupported methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({ method: 'PATCH' });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });
  });
});