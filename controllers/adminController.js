const User = require('../models/User');
const Diagram = require('../models/Diagram');

class AdminController {
  // User Management
  static getUsers(req, res) {
    try {
      const users = User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const user = User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.update({ role });
      res.json({ message: 'User role updated', user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }

  static deactivateUser(req, res) {
    try {
      const { userId } = req.params;
      const user = User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.update({ active: false });
      res.json({ message: 'User deactivated', user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to deactivate user' });
    }
  }

  // Diagram Moderation
  static getDiagrams(req, res) {
    try {
      const { status } = req.query;
      const diagrams = status ? Diagram.findByStatus(status) : Diagram.findAll();
      res.json(diagrams);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch diagrams' });
    }
  }

  static moderateDiagram(req, res) {
    try {
      const { diagramId } = req.params;
      const { status } = req.body;

      const diagram = Diagram.findById(diagramId);
      if (!diagram) {
        return res.status(404).json({ error: 'Diagram not found' });
      }

      diagram.updateStatus(status);
      res.json({ message: 'Diagram status updated', diagram });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static deleteDiagram(req, res) {
    try {
      const { diagramId } = req.params;
      const diagram = Diagram.findById(diagramId);

      if (!diagram) {
        return res.status(404).json({ error: 'Diagram not found' });
      }

      diagram.delete();
      res.json({ message: 'Diagram deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete diagram' });
    }
  }

  // Admin Dashboard
  static getDashboard(req, res) {
    try {
      const totalUsers = User.findAll().length;
      const activeUsers = User.findAll().filter(u => u.active).length;
      const totalDiagrams = Diagram.findAll().length;
      const pendingDiagrams = Diagram.findByStatus('pending').length;

      const stats = {
        totalUsers,
        activeUsers,
        totalDiagrams,
        pendingDiagrams
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  }
}

module.exports = AdminController;