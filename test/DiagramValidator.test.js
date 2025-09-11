import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DiagramValidator } from '../src/validator/DiagramValidator.js';
import { ValidationError } from '../src/errors/MermaidError.js';

describe('DiagramValidator', () => {
  test('validates valid flowchart diagram', () => {
    const diagram = 'graph TD\n  A --> B';
    assert.doesNotThrow(() => DiagramValidator.validate(diagram));
  });

  test('throws error for empty diagram', () => {
    assert.throws(
      () => DiagramValidator.validate(''),
      ValidationError
    );
  });

  test('throws error for unsupported diagram type', () => {
    assert.throws(
      () => DiagramValidator.validate('invalidType\n  A --> B'),
      ValidationError
    );
  });

  test('detects unmatched brackets', () => {
    const diagram = 'graph TD\n  A[Start --> B';
    assert.throws(
      () => DiagramValidator.validate(diagram),
      ValidationError
    );
  });

  test('identifies diagram type correctly', () => {
    const flowchart = 'graph TD\n  A --> B';
    assert.strictEqual(DiagramValidator.getDiagramType(flowchart), 'graph');
    
    const sequence = 'sequenceDiagram\n  A->>B: Hello';
    assert.strictEqual(DiagramValidator.getDiagramType(sequence), 'sequenceDiagram');
  });
});