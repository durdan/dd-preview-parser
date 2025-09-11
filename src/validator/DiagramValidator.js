import { ValidationError } from '../errors/MermaidError.js';

export class DiagramValidator {
  static SUPPORTED_DIAGRAMS = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
    'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie',
    'gitgraph', 'mindmap', 'timeline'
  ];

  static validate(diagramText) {
    if (!diagramText || typeof diagramText !== 'string') {
      throw new ValidationError('Diagram text must be a non-empty string');
    }

    const trimmed = diagramText.trim();
    if (!trimmed) {
      throw new ValidationError('Diagram text cannot be empty');
    }

    this._validateDiagramType(trimmed);
    this._validateBasicSyntax(trimmed);
    
    return true;
  }

  static _validateDiagramType(diagramText) {
    const lines = diagramText.split('\n').map(line => line.trim()).filter(line => line);
    const firstLine = lines[0];

    const hasValidType = this.SUPPORTED_DIAGRAMS.some(type => 
      firstLine.startsWith(type) || firstLine.includes(type)
    );

    if (!hasValidType) {
      throw new ValidationError(
        `Unsupported diagram type. First line: "${firstLine}". Supported types: ${this.SUPPORTED_DIAGRAMS.join(', ')}`,
        1
      );
    }
  }

  static _validateBasicSyntax(diagramText) {
    const lines = diagramText.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check for unmatched brackets/parentheses
      const brackets = { '(': ')', '[': ']', '{': '}' };
      const stack = [];
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (brackets[char]) {
          stack.push(brackets[char]);
        } else if (Object.values(brackets).includes(char)) {
          if (stack.length === 0 || stack.pop() !== char) {
            throw new ValidationError(
              `Unmatched bracket "${char}" in line: ${line}`,
              i + 1,
              j + 1
            );
          }
        }
      }

      if (stack.length > 0) {
        throw new ValidationError(
          `Unclosed bracket in line: ${line}`,
          i + 1
        );
      }
    }
  }

  static getDiagramType(diagramText) {
    const trimmed = diagramText.trim();
    const firstLine = trimmed.split('\n')[0].trim();
    
    for (const type of this.SUPPORTED_DIAGRAMS) {
      if (firstLine.startsWith(type) || firstLine.includes(type)) {
        return type;
      }
    }
    
    return 'unknown';
  }
}