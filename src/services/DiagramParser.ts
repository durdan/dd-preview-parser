export interface ParseResult {
  isValid: boolean;
  error?: string;
  parsedContent?: string;
}

export class DiagramParser {
  static parse(content: string): ParseResult {
    if (!content.trim()) {
      return { isValid: true, parsedContent: '' };
    }

    // Basic validation for common diagram types
    const trimmed = content.trim();
    
    // Check for basic mermaid syntax
    if (!this.isValidMermaidSyntax(trimmed)) {
      return {
        isValid: false,
        error: 'Invalid diagram syntax. Please check your diagram format.'
      };
    }

    return {
      isValid: true,
      parsedContent: trimmed
    };
  }

  private static isValidMermaidSyntax(content: string): boolean {
    // Basic validation - check for common mermaid diagram types
    const validStarters = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
      'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie'
    ];

    const firstLine = content.split('\n')[0].toLowerCase().trim();
    return validStarters.some(starter => firstLine.startsWith(starter));
  }
}