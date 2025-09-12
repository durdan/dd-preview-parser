import connectDB from '../../../lib/mongodb';
import Diagram from '../../../models/Diagram';
import { validateDiagramInput, validateObjectId } from '../../../lib/validation';
import { handleError, createErrorResponse } from '../../../lib/errorHandler';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (!validateObjectId(id)) {
    const { status, response } = createErrorResponse(400, 'Invalid diagram ID');
    return res.status(status).json(response);
  }

  switch (req.method) {
    case 'GET':
      return await getDiagram(req, res, id);
    case 'PUT':
      return await updateDiagram(req, res, id);
    case 'DELETE':
      return await deleteDiagram(req, res, id);
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
  }
}

async function getDiagram(req, res, id) {
  try {
    const diagram = await Diagram.findById(id);
    
    if (!diagram) {
      const { status, response } = createErrorResponse(404, 'Diagram not found');
      return res.status(status).json(response);
    }

    return res.status(200).json({
      success: true,
      data: diagram
    });
  } catch (error) {
    return handleError(error, res);
  }
}

async function updateDiagram(req, res, id) {
  try {
    const validationErrors = validateDiagramInput(req.body);
    
    if (validationErrors.length > 0) {
      const { status, response } = createErrorResponse(400, 'Validation failed', validationErrors);
      return res.status(status).json(response);
    }

    const diagram = await Diagram.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!diagram) {
      const { status, response } = createErrorResponse(404, 'Diagram not found');
      return res.status(status).json(response);
    }

    return res.status(200).json({
      success: true,
      data: diagram
    });
  } catch (error) {
    return handleError(error, res);
  }
}

async function deleteDiagram(req, res, id) {
  try {
    const diagram = await Diagram.findByIdAndDelete(id);

    if (!diagram) {
      const { status, response } = createErrorResponse(404, 'Diagram not found');
      return res.status(status).json(response);
    }

    return res.status(200).json({
      success: true,
      message: 'Diagram deleted successfully'
    });
  } catch (error) {
    return handleError(error, res);
  }
}