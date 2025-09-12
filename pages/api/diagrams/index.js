import connectDB from '../../../lib/mongodb';
import Diagram from '../../../models/Diagram';
import { validateDiagramInput } from '../../../lib/validation';
import { handleError, createErrorResponse } from '../../../lib/errorHandler';

export default async function handler(req, res) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      return await getDiagrams(req, res);
    case 'POST':
      return await createDiagram(req, res);
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
  }
}

async function getDiagrams(req, res) {
  try {
    const diagrams = await Diagram.find({}).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      data: diagrams,
      count: diagrams.length
    });
  } catch (error) {
    return handleError(error, res);
  }
}

async function createDiagram(req, res) {
  try {
    const validationErrors = validateDiagramInput(req.body);
    
    if (validationErrors.length > 0) {
      const { status, response } = createErrorResponse(400, 'Validation failed', validationErrors);
      return res.status(status).json(response);
    }

    const diagram = await Diagram.create(req.body);
    
    return res.status(201).json({
      success: true,
      data: diagram
    });
  } catch (error) {
    return handleError(error, res);
  }
}