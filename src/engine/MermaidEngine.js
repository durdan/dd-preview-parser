import { MermaidParser } from '../parser/MermaidParser.js';
import { DiagramValidator } from '../validator/DiagramValidator.js';
import { MermaidError } from '../errors/MermaidError.js';

export class MermaidEngine {
  constructor() {
    this.parser = new MermaidParser();
  }

  async processDiagram(diagramText, options = {}) {
    const { validate = true, render = true, elementId = 'mermaid-diagram' } = options;

    try {
      // Step 1: Basic validation
      if (validate) {
        DiagramValidator.validate(diagramText);
      }

      // Step 2: Parse diagram
      const parseResult = await this.parser.parse(diagramText, elementId);

      // Step 3: Additional syntax validation using mermaid
      const syntaxValidation = await this.parser.validateSyntax(diagramText);
      
      const result = {
        isValid: parseResult.isValid && syntaxValidation.isValid,
        diagramType: DiagramValidator.getDiagramType(diagramText),
        parseResult,
        syntaxValidation,
        errors: syntaxValidation.errors || []
      };

      // Step 4: Render if requested and valid
      if (render && result.isValid) {
        const renderResult = await this.parser.render(diagramText, elementId);
        result.renderResult = renderResult;
        result.svg = renderResult.svg;
      }

      return result;
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof MermaidError ? error.toJSON() : {
          message: error.message,
          type: 'UNKNOWN_ERROR'
        }],
        diagramType: 'unknown'
      };
    }
  }

  async validateOnly(diagramText) {
    return this.processDiagram(diagramText, { render: false });
  }

  async renderOnly(diagramText, elementId = 'mermaid-diagram') {
    return this.processDiagram(diagramText, { validate: false, elementId });
  }

  getSupportedDiagramTypes() {
    return DiagramValidator.SUPPORTED_DIAGRAMS;
  }
}