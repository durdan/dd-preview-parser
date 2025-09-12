import { validateDiagramInput, validateObjectId } from '../../lib/validation';

describe('Validation utilities', () => {
  describe('validateDiagramInput', () => {
    it('should return no errors for valid input', () => {
      const validInput = {
        name: 'Test Diagram',
        description: 'A test diagram',
        content: { nodes: [], edges: [] }
      };

      const errors = validateDiagramInput(validInput);
      expect(errors).toHaveLength(0);
    });

    it('should return error for missing name', () => {
      const invalidInput = {
        description: 'A test diagram',
        content: { nodes: [] }
      };

      const errors = validateDiagramInput(invalidInput);
      expect(errors).toContain('Name is required and must be a non-empty string');
    });

    it('should return error for missing content', () => {
      const invalidInput = {
        name: 'Test Diagram',
        description: 'A test diagram'
      };

      const errors = validateDiagramInput(invalidInput);
      expect(errors).toContain('Content is required');
    });

    it('should return error for name too long', () => {
      const invalidInput = {
        name: 'a'.repeat(101),
        content: { nodes: [] }
      };

      const errors = validateDiagramInput(invalidInput);
      expect(errors).toContain('Name cannot exceed 100 characters');
    });
  });

  describe('validateObjectId', () => {
    it('should return true for valid ObjectId', () => {
      const validId = '507f1f77bcf86cd799439011';
      expect(validateObjectId(validId)).toBe(true);
    });

    it('should return false for invalid ObjectId', () => {
      const invalidId = 'invalid-id';
      expect(validateObjectId(invalidId)).toBe(false);
    });
  });
});