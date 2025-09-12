const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminAuth');

// Apply admin middleware to all routes
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// User Management
router.get('/users', AdminController.getUsers);
router.put('/users/:userId/role', AdminController.updateUserRole);
router.put('/users/:userId/deactivate', AdminController.deactivateUser);

// Diagram Moderation
router.get('/diagrams', AdminController.getDiagrams);
router.put('/diagrams/:diagramId/moderate', AdminController.moderateDiagram);
router.delete('/diagrams/:diagramId', AdminController.deleteDiagram);

module.exports = router;