const plantumlEncoder = require('plantuml-encoder');

class PlantUMLEncoderService {
  encode(plantUMLCode) {
    if (!plantUMLCode || typeof plantUMLCode !== 'string') {
      throw new Error('PlantUML code must be a non-empty string');
    }

    try {
      return plantumlEncoder.encode(plantUMLCode);
    } catch (error) {
      throw new Error(`Failed to encode PlantUML: ${error.message}`);
    }
  }

  decode(encodedString) {
    if (!encodedString || typeof encodedString !== 'string') {
      throw new Error('Encoded string must be a non-empty string');
    }

    try {
      return plantumlEncoder.decode(encodedString);
    } catch (error) {
      throw new Error(`Failed to decode PlantUML: ${error.message}`);
    }
  }

  generateUrl(plantUMLCode, serverUrl = 'http://www.plantuml.com/plantuml', format = 'svg') {
    const encoded = this.encode(plantUMLCode);
    return `${serverUrl}/${format}/${encoded}`;
  }
}

module.exports = PlantUMLEncoderService;