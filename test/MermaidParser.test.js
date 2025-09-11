import { test, describe } from 'node:test';
import assert from 'node:assert';
import { MermaidParser } from '../src/parser/MermaidParser.js';
import { MermaidError } from '../src/errors/MermaidError.js';

describe('MermaidParser', () => {
  let parser;

  test('setup', () => {
    parser = new MermaidParser();
  });

  test('parses valid diagram successfully', async () => {
    const diagram = 'graph TD\n  A --> B';
    const result = await parser.parse(diagram);
    
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(typeof result.parseResult, 'object');
  });

  test('validates syntax correctly', async () => {
    const validDiagram = 'graph TD\n  A --> B';
    const result = await parser.validateSyntax(validDiagram);
    
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  test('detects syntax errors', async () => {
    const invalidDiagram = 'graph TD\n  A --> --> B';
    const result = await parser.validateSyntax(invalidDiagram);
    
    assert.strictEqual(result.isValid, false);
    assert(result.errors.length > 0);
  });

  test('renders diagram to SVG', async () => {
    const diagram = 'graph TD\n  A --> B';
    const result = await parser.render(diagram);
    
    assert.strictEqual(result.isValid, true);
    assert(result.svg.includes('<svg'));
    assert(typeof result.svg, 'string');
  });
});