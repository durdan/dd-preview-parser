const Diagram = require('../models/Diagram');
const AccessControlService = require('./AccessControlService');

class DiagramService {
  /**
   * Create a new diagram
   */
  static async createDiagram(userId, diagramData) {
    const { title, description, content, isPublic } = diagramData;

    if (!title || !title.trim()) {
      throw new Error('Title is required');
    }

    const diagram = new Diagram({
      title: title.trim(),
      description: description?.trim(),
      content: content || {},
      owner: userId,
      isPublic: Boolean(isPublic)
    });

    await diagram.save();
    return diagram.populate('owner', 'name email');
  }

  /**
   * Get diagram by ID with permission check
   */
  static async getDiagram(userId, diagramId) {
    const hasAccess = await AccessControlService.hasPermission(
      userId, 
      diagramId, 
      AccessControlService.PERMISSIONS.READ
    );

    if (!hasAccess) {
      throw new Error('Access denied');
    }

    const diagram = await Diagram.findById(diagramId)
      .populate('owner', 'name email')
      .populate('permissions.user', 'name email');

    return diagram;
  }

  /**
   * Update diagram with permission check
   */
  static async updateDiagram(userId, diagramId, updateData) {
    const hasAccess = await AccessControlService.hasPermission(
      userId, 
      diagramId, 
      AccessControlService.PERMISSIONS.WRITE
    );

    if (!hasAccess) {
      throw new Error('Write access denied');
    }

    const allowedFields = ['title', 'description', 'content', 'isPublic'];
    const updates = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    if (updates.title !== undefined && (!updates.title || !updates.title.trim())) {
      throw new Error('Title cannot be empty');
    }

    const diagram = await Diagram.findByIdAndUpdate(
      diagramId,
      updates,
      { new: true, runValidators: true }
    )
    .populate('owner', 'name email')
    .populate('permissions.user', 'name email');

    return diagram;
  }

  /**
   * Delete diagram with permission check
   */
  static async deleteDiagram(userId, diagramId) {
    const diagram = await Diagram.findById(diagramId);
    if (!diagram) {
      throw new Error('Diagram not found');
    }

    // Only owner can delete
    if (diagram.owner.toString() !== userId.toString()) {
      throw new Error('Only owner can delete diagram');
    }

    await Diagram.findByIdAndDelete(diagramId);
    return { message: 'Diagram deleted successfully' };
  }
}

module.exports = DiagramService;