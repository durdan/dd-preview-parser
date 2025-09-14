class DiagramAuthService {
  constructor(sessionContext) {
    this.sessionContext = sessionContext;
  }

  canCreateDiagram() {
    return this.sessionContext.isAuthenticated();
  }

  canAccessDiagram(diagram) {
    const user = this.sessionContext.getCurrentUser();
    if (!user) return false;
    
    return diagram.ownerId === user.id;
  }

  canModifyDiagram(diagram) {
    return this.canAccessDiagram(diagram);
  }

  canDeleteDiagram(diagram) {
    return this.canAccessDiagram(diagram);
  }

  requireDiagramAccess(diagram) {
    if (!this.canAccessDiagram(diagram)) {
      throw new Error('Access denied: insufficient permissions for diagram');
    }
  }

  requireDiagramModification(diagram) {
    if (!this.canModifyDiagram(diagram)) {
      throw new Error('Modification denied: insufficient permissions for diagram');
    }
  }
}

module.exports = DiagramAuthService;