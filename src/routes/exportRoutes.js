const express = require('express');
const DiagramExporter = require('../services/DiagramExporter');
const FileManager = require('../services/FileManager');
const ExportOptimizer = require('../services/ExportOptimizer');
const ExportValidator = require('../validators/ExportValidator');
const ExportController = require('../controllers/ExportController');

const router = express.Router();

// Initialize services
const fileManager = new FileManager();
const optimizer = new ExportOptimizer();
const diagramExporter = new DiagramExporter(fileManager, optimizer);
const validator = new ExportValidator();
const exportController = new ExportController(diagramExporter, validator, fileManager, optimizer);

// Routes
router.post('/export', (req, res) => exportController.exportDiagram(req, res));
router.get('/status', (req, res) => exportController.getExportStatus(req, res));

// Cleanup on process exit
process.on('SIGINT', async () => {
  await diagramExporter.cleanup();
  fileManager.stopCleanupScheduler();
  process.exit(0);
});

module.exports = router;