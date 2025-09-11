const mermaid = require('mermaid');
const { JSDOM } = require('jsdom');

class DiagramRenderer {
  constructor() {
    // Setup DOM environment for server-side rendering
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.window = dom.window;
    global.document = dom.window.document;

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'default',
      fontFamily: 'Arial, sans-serif'
    });
  }

  /**
   * Renders Mermaid diagram to SVG
   * @param {string} diagramCode - Valid Mermaid diagram code
   * @param {Object} options - Rendering options (theme, etc.)
   * @returns {Promise<string>} - SVG string
   */
  async renderToSVG(diagramCode, options = {}) {
    if (!diagramCode) {
      throw new Error('Diagram code is required');
    }

    try {
      // Apply theme if specified
      if (options.theme) {
        mermaid.initialize({ theme: options.theme });
      }

      // Generate unique ID for the diagram
      const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Render the diagram
      const { svg } = await mermaid.render(diagramId, diagramCode);
      
      return this._cleanSVG(svg);
    } catch (error) {
      throw new Error(`Rendering failed: ${error.message}`);
    }
  }

  /**
   * Gets available themes
   * @returns {Array<string>} - List of available themes
   */
  getAvailableThemes() {
    return ['default', 'dark', 'forest', 'neutral', 'base'];
  }

  _cleanSVG(svg) {
    // Remove any potentially unsafe content and clean up the SVG
    return svg
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}

module.exports = DiagramRenderer;