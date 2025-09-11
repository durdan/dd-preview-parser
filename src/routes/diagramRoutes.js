const express = require('express');
const DiagramService = require('../services/DiagramService');

const router = express.Router();
const diagramService = new DiagramService();

/**
 * POST /api/diagrams/validate
 * Validates Mermaid diagram syntax
 */
router.post('/validate', async (req, res) => {
  try {
    const { diagramCode } = req.body;

    if (!diagramCode) {
      return res.status(400).json({
        error: 'diagramCode is required'
      });
    }

    const result = await diagramService.validateDiagram(diagramCode);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/diagrams/render
 * Renders Mermaid diagram to SVG
 */
router.post('/render', async (req, res) => {
  try {
    const { diagramCode, theme } = req.body;

    if (!diagramCode) {
      return res.status(400).json({
        error: 'diagramCode is required'
      });
    }

    const options = {};
    if (theme) {
      const availableThemes = diagramService.getAvailableThemes();
      if (!availableThemes.includes(theme)) {
        return res.status(400).json({
          error: `Invalid theme. Available themes: ${availableThemes.join(', ')}`
        });
      }
      options.theme = theme;
    }

    const result = await diagramService.renderDiagram(diagramCode, options);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Rendering failed',
        errors: result.errors
      });
    }

    res.json({
      svg: result.svg,
      diagramType: result.diagramType
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/diagrams/svg
 * Generates SVG file for download
 */
router.post('/svg', async (req, res) => {
  try {
    const { diagramCode, theme } = req.body;

    if (!diagramCode) {
      return res.status(400).json({
        error: 'diagramCode is required'
      });
    }

    const options = theme ? { theme } : {};
    const result = await diagramService.renderDiagram(diagramCode, options);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'SVG generation failed',
        errors: result.errors
      });
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', 'attachment; filename="diagram.svg"');
    res.send(result.svg);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/diagrams/themes
 * Gets available themes
 */
router.get('/themes', (req, res) => {
  try {
    const themes = diagramService.getAvailableThemes();
    res.json({ themes });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;