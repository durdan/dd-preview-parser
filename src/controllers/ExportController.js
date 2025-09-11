const fs = require('fs').promises;

class ExportController {
  constructor(diagramExporter, validator, fileManager, optimizer) {
    this.diagramExporter = diagramExporter;
    this.validator = validator;
    this.fileManager = fileManager;
    this.optimizer = optimizer;
  }

  async exportDiagram(req, res) {
    try {
      const validation = this.validator.validateExportRequest(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const { diagramHtml, format, options = {} } = req.body;
      const memoryCheck = this.optimizer.checkMemoryUsage();
      
      if (memoryCheck.isOverThreshold) {
        await this.optimizer.forceGarbageCollection();
      }

      let result;
      if (format.toLowerCase() === 'png') {
        result = await this.diagramExporter.exportToPNG(diagramHtml, options);
      } else {
        result = await this.diagramExporter.exportToPDF(diagramHtml, options);
      }

      const { filepath, filename } = result;
      
      // Set appropriate headers
      const contentType = format.toLowerCase() === 'png' ? 'image/png' : 'application/pdf';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Stream file and cleanup
      const fileBuffer = await fs.readFile(filepath);
      res.send(fileBuffer);

      // Cleanup file after sending
      setTimeout(() => {
        this.fileManager.deleteFile(filepath);
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({
        error: 'Export failed',
        message: error.message
      });
    }
  }

  async getExportStatus(req, res) {
    try {
      const memoryUsage = this.optimizer.checkMemoryUsage();
      
      res.json({
        status: 'operational',
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
          isOverThreshold: memoryUsage.isOverThreshold
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Status check failed',
        message: error.message
      });
    }
  }
}

module.exports = ExportController;