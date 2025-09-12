import { analyzeDiagram } from '../../lib/diagram-analyzer.js';
import { validateDiagramInput } from '../../lib/validators.js';
import { handleApiError } from '../../lib/errors.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, diagramType, context } = validateDiagramInput(req.body);
    
    const analysis = await analyzeDiagram(image, diagramType, context);
    
    res.status(200).json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error);
    res.status(statusCode).json({ 
      success: false, 
      error: errorMessage 
    });
  }
}