const axios = require('axios');

class PlantUMLServerClient {
  constructor(serverUrl = 'http://www.plantuml.com/plantuml') {
    this.serverUrl = serverUrl;
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'PlantUML-Parser/1.0.0'
      }
    });
  }

  async renderDiagram(encodedPlantUML, format = 'svg') {
    const validFormats = ['svg', 'png', 'txt', 'pdf'];
    
    if (!validFormats.includes(format)) {
      throw new Error(`Invalid format: ${format}. Supported formats: ${validFormats.join(', ')}`);
    }

    const url = `${this.serverUrl}/${format}/${encodedPlantUML}`;
    
    try {
      const response = await this.client.get(url, {
        responseType: format === 'svg' || format === 'txt' ? 'text' : 'arraybuffer'
      });
      
      return {
        data: response.data,
        contentType: this.getContentType(format),
        format
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error: Unable to reach PlantUML server');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  async checkServerHealth() {
    try {
      const response = await this.client.get(`${this.serverUrl}/png/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  getContentType(format) {
    const contentTypes = {
      svg: 'image/svg+xml',
      png: 'image/png',
      txt: 'text/plain',
      pdf: 'application/pdf'
    };
    return contentTypes[format] || 'application/octet-stream';
  }
}

module.exports = PlantUMLServerClient;