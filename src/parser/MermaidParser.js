import mermaid from 'mermaid';
import { JSDOM } from 'jsdom';
import { MermaidError, RenderError } from '../errors/MermaidError.js';

export class MermaidParser {
  constructor() {
    this._setupEnvironment();
    this._initializeMermaid();
  }

  _setupEnvironment() {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="mermaid-container"></div></body></html>');
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
  }

  _initializeMermaid() {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Arial',
      logLevel: 'error'
    });
  }

  async parse(diagramText, elementId = 'mermaid-diagram') {
    try {
      // Validate that mermaid can parse the diagram
      const parseResult = await mermaid.parse(diagramText);
      
      if (!parseResult) {
        throw new RenderError('Failed to parse diagram syntax');
      }

      return {
        isValid: true,
        parseResult,
        diagramText: diagramText.trim()
      };
    } catch (error) {
      throw new MermaidError(
        `Parse error: ${error.message}`,
        'PARSE_ERROR'
      );
    }
  }

  async render(diagramText, elementId = 'mermaid-diagram') {
    try {
      const parseResult = await this.parse(diagramText);
      
      // Create container element
      const container = document.getElementById('mermaid-container');
      container.innerHTML = `<div id="${elementId}"></div>`;

      // Render the diagram
      const { svg } = await mermaid.render(elementId, diagramText);
      
      return {
        svg,
        elementId,
        diagramText: parseResult.diagramText,
        isValid: true
      };
    } catch (error) {
      if (error instanceof MermaidError) {
        throw error;
      }
      throw new RenderError(`Render error: ${error.message}`);
    }
  }

  async validateSyntax(diagramText) {
    try {
      await mermaid.parse(diagramText);
      return { isValid: true, errors: [] };
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          message: error.message,
          type: 'SYNTAX_ERROR'
        }]
      };
    }
  }
}