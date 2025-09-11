export class MermaidError extends Error {
  constructor(message, type = 'PARSE_ERROR', line = null, column = null) {
    super(message);
    this.name = 'MermaidError';
    this.type = type;
    this.line = line;
    this.column = column;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      line: this.line,
      column: this.column
    };
  }
}

export class ValidationError extends MermaidError {
  constructor(message, line = null, column = null) {
    super(message, 'VALIDATION_ERROR', line, column);
    this.name = 'ValidationError';
  }
}

export class RenderError extends MermaidError {
  constructor(message, line = null, column = null) {
    super(message, 'RENDER_ERROR', line, column);
    this.name = 'RenderError';
  }
}