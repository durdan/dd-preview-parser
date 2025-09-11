const DiagramValidator = require('../validators/DiagramValidator');
const DiagramRenderer = require('../renderers/DiagramRenderer');

class DiagramService {
  constructor() {
    this.validator = new DiagramValidator();
    this.renderer = new DiagramRenderer();
  }

  /**
   * Validates a Mermaid diagram
   * @param {string} diagramCode - The diagram code to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validateDiagram(diagramCode) {
    return await this.validator.validate(diagramCode);
  }

  /**
   * Renders a diagram to SVG with validation
   * @param {string} diagramCode - The diagram code
   * @param {Object} options - Rendering options
   * @returns {Promise<Object>} - Render result with SVG or errors
   */
  async renderDiagram(diagramCode, options = {}) {
    // First validate the diagram
    const validation = await this.validateDiagram(diagramCode);
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const svg = await this.renderer.renderToSVG(diagramCode, options);
      
      return {
        success: true,
        svg,
        diagramType: validation.diagramType
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Gets available rendering themes
   * @returns {Array<string>} - Available themes
   */
  getAvailableThemes() {
    return this.renderer.getAvailableThemes();
  }
}

module.exports = DiagramService;