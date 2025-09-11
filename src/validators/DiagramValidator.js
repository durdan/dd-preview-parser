const mermaid = require('mermaid');

class DiagramValidator {
  constructor() {
    // Initialize mermaid with safe configuration
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'default'
    });
  }

  /**
   * Validates Mermaid diagram syntax
   * @param {string} diagramCode - The Mermaid diagram code
   * @returns {Object} - Validation result with isValid and errors
   */
  async validate(diagramCode) {
    if (!diagramCode || typeof diagramCode !== 'string') {
      return {
        isValid: false,
        errors: ['Diagram code must be a non-empty string']
      };
    }

    const trimmedCode = diagramCode.trim();
    if (!trimmedCode) {
      return {
        isValid: false,
        errors: ['Diagram code cannot be empty']
      };
    }

    try {
      // Use mermaid's parse function to validate syntax
      const parseResult = await mermaid.parse(trimmedCode);
      
      return {
        isValid: true,
        errors: [],
        diagramType: this._extractDiagramType(trimmedCode)
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [this._formatError(error.message)]
      };
    }
  }

  _extractDiagramType(code) {
    const firstLine = code.split('\n')[0].trim();
    const typeMatch = firstLine.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitgraph)/);
    return typeMatch ? typeMatch[1] : 'unknown';
  }

  _formatError(errorMessage) {
    // Clean up mermaid error messages for better user experience
    return errorMessage
      .replace(/Parse error on line \d+:/, 'Syntax error:')
      .replace(/Expecting .+/, 'Invalid syntax')
      .trim();
  }
}

module.exports = DiagramValidator;