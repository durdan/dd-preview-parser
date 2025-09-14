class PlantUMLParser {
  constructor() {
    this.validDiagramTypes = [
      'sequence', 'usecase', 'class', 'activity', 'component',
      'state', 'object', 'deployment', 'timing', 'network',
      'wireframe', 'archimate', 'gantt', 'mindmap', 'wbs'
    ];
  }

  parse(plantUMLCode) {
    if (!plantUMLCode || typeof plantUMLCode !== 'string') {
      throw new Error('PlantUML code must be a non-empty string');
    }

    const trimmedCode = plantUMLCode.trim();
    
    if (!this.isValidPlantUMLSyntax(trimmedCode)) {
      throw new Error('Invalid PlantUML syntax');
    }

    return {
      code: trimmedCode,
      type: this.detectDiagramType(trimmedCode),
      elements: this.extractElements(trimmedCode),
      metadata: this.extractMetadata(trimmedCode)
    };
  }

  isValidPlantUMLSyntax(code) {
    // Basic syntax validation
    const hasStartTag = code.includes('@startuml') || code.includes('@start');
    const hasEndTag = code.includes('@enduml') || code.includes('@end');
    
    return hasStartTag && hasEndTag;
  }

  detectDiagramType(code) {
    const lowerCode = code.toLowerCase();
    
    for (const type of this.validDiagramTypes) {
      if (lowerCode.includes(`@start${type}`) || 
          (lowerCode.includes('@startuml') && lowerCode.includes(type))) {
        return type;
      }
    }
    
    // Default detection based on content
    if (lowerCode.includes('->') || lowerCode.includes('-->')) {
      return 'sequence';
    }
    if (lowerCode.includes('class ') || lowerCode.includes('interface ')) {
      return 'class';
    }
    if (lowerCode.includes('usecase') || lowerCode.includes('actor')) {
      return 'usecase';
    }
    
    return 'unknown';
  }

  extractElements(code) {
    const elements = [];
    const lines = code.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('@') && !trimmedLine.startsWith('!')) {
        elements.push({
          type: this.classifyElement(trimmedLine),
          content: trimmedLine
        });
      }
    }
    
    return elements;
  }

  classifyElement(line) {
    if (line.includes('->') || line.includes('-->')) return 'relationship';
    if (line.includes('class ') || line.includes('interface ')) return 'class';
    if (line.includes('actor ') || line.includes('usecase ')) return 'actor';
    if (line.includes('note ')) return 'note';
    return 'element';
  }

  extractMetadata(code) {
    const metadata = {};
    const lines = code.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('!')) {
        const [key, ...valueParts] = trimmedLine.substring(1).split(' ');
        metadata[key] = valueParts.join(' ');
      }
    }
    
    return metadata;
  }
}

export default PlantUMLParser;