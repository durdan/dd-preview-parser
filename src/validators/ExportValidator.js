class ExportValidator {
  validateExportRequest(body) {
    const { diagramHtml, format, options = {} } = body;
    const errors = [];

    if (!diagramHtml || typeof diagramHtml !== 'string') {
      errors.push('diagramHtml is required and must be a string');
    }

    if (!format || !['png', 'pdf'].includes(format.toLowerCase())) {
      errors.push('format must be either "png" or "pdf"');
    }

    if (format === 'png') {
      this.validatePNGOptions(options, errors);
    } else if (format === 'pdf') {
      this.validatePDFOptions(options, errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validatePNGOptions(options, errors) {
    const { width, height, quality } = options;

    if (width && (!Number.isInteger(width) || width < 100 || width > 4096)) {
      errors.push('width must be an integer between 100 and 4096');
    }

    if (height && (!Number.isInteger(height) || height < 100 || height > 4096)) {
      errors.push('height must be an integer between 100 and 4096');
    }

    if (quality && (!Number.isInteger(quality) || quality < 1 || quality > 100)) {
      errors.push('quality must be an integer between 1 and 100');
    }
  }

  validatePDFOptions(options, errors) {
    const { format, landscape } = options;
    const validFormats = ['A4', 'A3', 'A5', 'Letter', 'Legal', 'Tabloid'];

    if (format && !validFormats.includes(format)) {
      errors.push(`format must be one of: ${validFormats.join(', ')}`);
    }

    if (landscape !== undefined && typeof landscape !== 'boolean') {
      errors.push('landscape must be a boolean');
    }
  }
}

module.exports = ExportValidator;