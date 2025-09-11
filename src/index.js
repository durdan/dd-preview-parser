import { MermaidEngine } from './engine/MermaidEngine.js';

export { MermaidEngine } from './engine/MermaidEngine.js';
export { MermaidParser } from './parser/MermaidParser.js';
export { DiagramValidator } from './validator/DiagramValidator.js';
export { MermaidError, ValidationError, RenderError } from './errors/MermaidError.js';

// Example usage
async function example() {
  const engine = new MermaidEngine();

  const flowchartDiagram = `
    graph TD
      A[Start] --> B{Decision}
      B -->|Yes| C[Action 1]
      B -->|No| D[Action 2]
      C --> E[End]
      D --> E
  `;

  try {
    console.log('Processing flowchart diagram...');
    const result = await engine.processDiagram(flowchartDiagram);
    
    if (result.isValid) {
      console.log('✅ Diagram is valid!');
      console.log('Diagram type:', result.diagramType);
      console.log('SVG length:', result.svg?.length || 0);
    } else {
      console.log('❌ Diagram has errors:');
      result.errors.forEach(error => console.log('-', error.message));
    }
  } catch (error) {
    console.error('Engine error:', error.message);
  }
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  example();
}