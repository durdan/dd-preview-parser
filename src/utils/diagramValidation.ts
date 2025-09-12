export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  type: 'mermaid' | 'plantuml' | 'unknown';
}

export const validateMermaidSyntax = (content: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const trimmedContent = content.trim();
  
  if (!trimmedContent) {
    return {
      isValid: false,
      errors: ['Content is empty'],
      warnings: [],
      type: 'unknown'
    };
  }

  // Basic Mermaid validation
  const mermaidPatterns = {
    graph: /^graph\s+(TD|TB|BT|RL|LR)/m,
    flowchart: /^flowchart\s+(TD|TB|BT|RL|LR)/m,
    sequenceDiagram: /^sequenceDiagram/m,
    classDiagram: /^classDiagram/m
  };

  const hasValidStart = Object.values(mermaidPatterns).some(pattern => 
    pattern.test(trimmedContent)
  );

  if (!hasValidStart) {
    errors.push('No valid Mermaid diagram type declaration found');
  }

  // Check for common syntax issues
  if (trimmedContent.includes('-->') && !trimmedContent.match(/\w+\s*-->\s*\w+/)) {
    warnings.push('Arrow syntax may be incomplete');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    type: 'mermaid'
  };
};

export const validatePlantUMLSyntax = (content: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const trimmedContent = content.trim();
  
  if (!trimmedContent) {
    return {
      isValid: false,
      errors: ['Content is empty'],
      warnings: [],
      type: 'unknown'
    };
  }

  // Check for proper PlantUML structure
  const hasStartTag = /@startuml/i.test(trimmedContent);
  const hasEndTag = /@enduml/i.test(trimmedContent);

  if (hasStartTag && !hasEndTag) {
    errors.push('Missing @enduml tag');
  } else if (!hasStartTag && hasEndTag) {
    errors.push('Missing @startuml tag');
  } else if (!hasStartTag && !hasEndTag) {
    // Check if it looks like PlantUML without explicit tags
    const hasPlantUMLKeywords = /class\s+\w+|participant\s+\w+|component\s+\w+/i.test(trimmedContent);
    if (hasPlantUMLKeywords) {
      warnings.push('Consider adding @startuml/@enduml tags for better compatibility');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    type: 'plantuml'
  };
};

export const validateDiagram = (content: string, type: 'mermaid' | 'plantuml' | 'unknown'): ValidationResult => {
  switch (type) {
    case 'mermaid':
      return validateMermaidSyntax(content);
    case 'plantuml':
      return validatePlantUMLSyntax(content);
    default:
      return {
        isValid: false,
        errors: ['Unknown diagram type'],
        warnings: [],
        type: 'unknown'
      };
  }
};