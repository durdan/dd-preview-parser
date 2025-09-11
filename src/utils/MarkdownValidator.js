export class MarkdownValidator {
  static validateContent(content) {
    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }
    
    if (content.length > 50000) {
      throw new Error('Content exceeds maximum length of 50,000 characters');
    }
    
    return true;
  }

  static sanitizeContent(content) {
    if (!content || typeof content !== 'string') {
      return '';
    }
    
    // Basic sanitization - remove potential script tags
    return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  static extractCodeBlocks(content) {
    const codeBlockRegex = /