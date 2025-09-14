const DiagramRepository = require('./repositories/DiagramRepository');
const DiagramAuthService = require('./auth/DiagramAuthService');

class DiagramEditor {
  constructor(sessionContext, diagramRepository = null) {
    this.sessionContext = sessionContext;
    this.diagramRepository = diagramRepository || new DiagramRepository();
    this.authService = new DiagramAuthService(sessionContext);
    this.currentDiagram = null;
  }

  createDiagram(id, name, content = '') {
    if (!this.authService.canCreateDiagram()) {
      throw new Error('Authentication required to create diagrams');
    }

    const user = this.sessionContext.requireAuthentication();
    const diagram = this.diagramRepository.create(id, name, content, user.id);
    this.currentDiagram = diagram;
    return diagram;
  }

  loadDiagram(id) {
    const user = this.sessionContext.requireAuthentication();
    const diagram = this.diagramRepository.findByOwnerAndId(user.id, id);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${id} not found or access denied`);
    }

    this.authService.requireDiagramAccess(diagram);
    this.currentDiagram = diagram;
    return diagram;
  }

  saveDiagram(content) {
    if (!this.currentDiagram) {
      throw new Error('No diagram loaded');
    }

    this.authService.requireDiagramModification(this.currentDiagram);
    
    return this.diagramRepository.update(this.currentDiagram.id, { content });
  }

  renameDiagram(newName) {
    if (!this.currentDiagram) {
      throw new Error('No diagram loaded');
    }

    this.authService.requireDiagramModification(this.currentDiagram);
    
    return this.diagramRepository.update(this.currentDiagram.id, { name: newName });
  }

  deleteDiagram(id) {
    const user = this.sessionContext.requireAuthentication();
    const diagram = this.diagramRepository.findByOwnerAndId(user.id, id);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${id} not found or access denied`);
    }

    this.authService.requireDiagramModification(diagram);
    
    const deleted = this.diagramRepository.delete(id);
    if (this.currentDiagram && this.currentDiagram.id === id) {
      this.currentDiagram = null;
    }
    
    return deleted;
  }

  listUserDiagrams() {
    const user = this.sessionContext.requireAuthentication();
    return this.diagramRepository.findByOwner(user.id);
  }

  getCurrentDiagram() {
    return this.currentDiagram;
  }
}

module.exports = DiagramEditor;