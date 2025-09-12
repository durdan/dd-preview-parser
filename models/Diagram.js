const diagrams = new Map();

class Diagram {
  constructor(id, title, content, userId) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.userId = userId;
    this.status = 'pending'; // 'pending', 'approved', 'rejected'
    this.createdAt = new Date();
  }

  static findById(id) {
    return diagrams.get(id);
  }

  static findAll() {
    return Array.from(diagrams.values());
  }

  static findByStatus(status) {
    return Array.from(diagrams.values()).filter(d => d.status === status);
  }

  static create(diagramData) {
    const id = Date.now().toString();
    const diagram = new Diagram(id, diagramData.title, diagramData.content, diagramData.userId);
    diagrams.set(id, diagram);
    return diagram;
  }

  updateStatus(status) {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new Error('Invalid status');
    }
    this.status = status;
    return this;
  }

  delete() {
    diagrams.delete(this.id);
  }
}

module.exports = Diagram;