const UserDiagram = require('../models/UserDiagram');

class DiagramRepository {
  constructor() {
    this.diagrams = new Map();
  }

  create(id, name, content, ownerId) {
    if (this.diagrams.has(id)) {
      throw new Error(`Diagram with ID ${id} already exists`);
    }

    const diagram = new UserDiagram(id, name, content, ownerId);
    this.diagrams.set(id, diagram);
    return diagram;
  }

  findById(id) {
    return this.diagrams.get(id) || null;
  }

  findByOwner(ownerId) {
    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    return Array.from(this.diagrams.values())
      .filter(diagram => diagram.ownerId === ownerId);
  }

  update(id, updates) {
    const diagram = this.findById(id);
    if (!diagram) {
      throw new Error(`Diagram with ID ${id} not found`);
    }

    if (updates.name !== undefined) {
      diagram.updateName(updates.name);
    }
    if (updates.content !== undefined) {
      diagram.updateContent(updates.content);
    }

    return diagram;
  }

  delete(id) {
    const existed = this.diagrams.has(id);
    this.diagrams.delete(id);
    return existed;
  }

  findByOwnerAndId(ownerId, id) {
    const diagram = this.findById(id);
    return diagram && diagram.isOwnedBy(ownerId) ? diagram : null;
  }
}

module.exports = DiagramRepository;