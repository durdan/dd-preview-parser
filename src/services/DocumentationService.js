class DocumentationService {
  constructor() {
    this.documents = new Map();
  }

  saveDocumentation(diagramId, content) {
    if (!diagramId || typeof diagramId !== 'string') {
      throw new Error('Invalid diagram ID');
    }
    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }
    
    this.documents.set(diagramId, {
      content,
      lastModified: new Date().toISOString()
    });
    
    return this.documents.get(diagramId);
  }

  getDocumentation(diagramId) {
    if (!diagramId || typeof diagramId !== 'string') {
      throw new Error('Invalid diagram ID');
    }
    
    return this.documents.get(diagramId) || { content: '', lastModified: null };
  }

  deleteDocumentation(diagramId) {
    if (!diagramId || typeof diagramId !== 'string') {
      throw new Error('Invalid diagram ID');
    }
    
    return this.documents.delete(diagramId);
  }

  listDocuments() {
    return Array.from(this.documents.entries()).map(([id, doc]) => ({
      id,
      ...doc
    }));
  }
}

export default DocumentationService;