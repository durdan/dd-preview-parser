class UserDiagram {
  constructor(id, name, content, ownerId, createdAt = new Date()) {
    this.validateInput(id, name, ownerId);
    
    this.id = id;
    this.name = name;
    this.content = content || '';
    this.ownerId = ownerId;
    this.createdAt = createdAt;
    this.updatedAt = createdAt;
  }

  validateInput(id, name, ownerId) {
    if (!id || typeof id !== 'string') {
      throw new Error('Diagram ID is required and must be a string');
    }
    if (!name || typeof name !== 'string') {
      throw new Error('Diagram name is required and must be a string');
    }
    if (!ownerId || typeof ownerId !== 'string') {
      throw new Error('Owner ID is required and must be a string');
    }
  }

  updateContent(content) {
    this.content = content || '';
    this.updatedAt = new Date();
  }

  updateName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Diagram name is required and must be a string');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  isOwnedBy(userId) {
    return this.ownerId === userId;
  }
}

module.exports = UserDiagram;