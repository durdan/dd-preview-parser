const Diagram = require('../models/Diagram');

class AccessControlService {
  static PERMISSIONS = {
    READ: 'read',
    WRITE: 'write',
    ADMIN: 'admin'
  };

  static PERMISSION_HIERARCHY = {
    read: ['read'],
    write: ['read', 'write'],
    admin: ['read', 'write', 'admin']
  };

  /**
   * Check if user has specific permission for a diagram
   */
  static async hasPermission(userId, diagramId, requiredPermission) {
    if (!userId || !diagramId || !requiredPermission) {
      throw new Error('Missing required parameters');
    }

    const diagram = await Diagram.findById(diagramId);
    if (!diagram) {
      throw new Error('Diagram not found');
    }

    // Owner has all permissions
    if (diagram.owner.toString() === userId.toString()) {
      return true;
    }

    // Check if diagram is public and only read access is required
    if (diagram.isPublic && requiredPermission === this.PERMISSIONS.READ) {
      return true;
    }

    // Check explicit permissions
    const userPermission = diagram.permissions.find(
      p => p.user.toString() === userId.toString()
    );

    if (!userPermission) {
      return false;
    }

    // Check if user's permission level includes the required permission
    const allowedPermissions = this.PERMISSION_HIERARCHY[userPermission.level];
    return allowedPermissions.includes(requiredPermission);
  }

  /**
   * Grant permission to a user for a diagram
   */
  static async grantPermission(ownerId, diagramId, targetUserId, permissionLevel) {
    if (!Object.values(this.PERMISSIONS).includes(permissionLevel)) {
      throw new Error('Invalid permission level');
    }

    const diagram = await Diagram.findById(diagramId);
    if (!diagram) {
      throw new Error('Diagram not found');
    }

    // Only owner can grant permissions
    if (diagram.owner.toString() !== ownerId.toString()) {
      throw new Error('Only diagram owner can grant permissions');
    }

    // Remove existing permission for this user
    diagram.permissions = diagram.permissions.filter(
      p => p.user.toString() !== targetUserId.toString()
    );

    // Add new permission
    diagram.permissions.push({
      user: targetUserId,
      level: permissionLevel
    });

    await diagram.save();
    return diagram;
  }

  /**
   * Revoke permission from a user for a diagram
   */
  static async revokePermission(ownerId, diagramId, targetUserId) {
    const diagram = await Diagram.findById(diagramId);
    if (!diagram) {
      throw new Error('Diagram not found');
    }

    // Only owner can revoke permissions
    if (diagram.owner.toString() !== ownerId.toString()) {
      throw new Error('Only diagram owner can revoke permissions');
    }

    // Cannot revoke owner's permissions
    if (diagram.owner.toString() === targetUserId.toString()) {
      throw new Error('Cannot revoke owner permissions');
    }

    diagram.permissions = diagram.permissions.filter(
      p => p.user.toString() !== targetUserId.toString()
    );

    await diagram.save();
    return diagram;
  }

  /**
   * Get all diagrams accessible to a user
   */
  static async getAccessibleDiagrams(userId) {
    const diagrams = await Diagram.find({
      $or: [
        { owner: userId },
        { 'permissions.user': userId },
        { isPublic: true }
      ]
    })
    .populate('owner', 'name email')
    .populate('permissions.user', 'name email')
    .sort({ updatedAt: -1 });

    return diagrams;
  }

  /**
   * Get diagrams owned by a user
   */
  static async getOwnedDiagrams(userId) {
    const diagrams = await Diagram.find({ owner: userId })
      .populate('permissions.user', 'name email')
      .sort({ updatedAt: -1 });

    return diagrams;
  }
}

module.exports = AccessControlService;