import PlantUMLParser from '../parsers/plantuml-parser.js';
import PlantUMLEncoderService from './plantuml-encoder.js';
import PlantUMLServerClient from './plantuml-server-client.js';

class PlantUMLRenderer {
  constructor(serverUrl) {
    this.parser = new PlantUMLParser();
    this.encoder = new PlantUMLEncoderService();
    this.serverClient = new PlantUMLServerClient(serverUrl);
  }

  async renderFromCode(plantUMLCode, format = 'svg') {
    // Parse and validate
    const parsed = this.parser.parse(plantUMLCode);
    
    // Encode
    const encoded = this.encoder.encode(plantUMLCode);
    
    // Render
    const result = await this.serverClient.renderDiagram(encoded, format);
    
    return {
      ...result,
      parsed,
      encoded,
      url: this.encoder.generateUrl(plantUMLCode, this.serverClient.serverUrl, format)
    };
  }

  async validateSyntax(plantUMLCode) {
    try {
      const parsed = this.parser.parse(plantUMLCode);
      return {
        valid: true,
        parsed,
        errors: []
      };
    } catch (error) {
      return {
        valid: false,
        parsed: null,
        errors: [error.message]
      };
    }
  }

  async getServerStatus() {
    const isHealthy = await this.serverClient.checkServerHealth();
    return {
      serverUrl: this.serverClient.serverUrl,
      healthy: isHealthy,
      timestamp: new Date().toISOString()
    };
  }
}

export default PlantUMLRenderer;