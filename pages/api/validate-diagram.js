import { validateMermaidDiagram } from '../../lib/diagram-validator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { diagram, diagramType } = req.body;

    if (!diagram || typeof diagram !== 'string') {
      return res.status(400).json({
        error: 'Invalid input: diagram content is required and must be a string'
      });
    }

    const validationResult = await validateMermaidDiagram(diagram, diagramType);
    
    return res.status(200).json(validationResult);
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      error: 'Internal server error during validation'
    });
  }
}