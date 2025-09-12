import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '../../utils/response';
import { requireAuth } from '../../utils/auth';
import { findDiagramById, updateDiagram, deleteDiagram, logAudit } from '../../utils/storage';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request);
    const diagram = findDiagramById(params.id);
    
    if (!diagram) {
      return errorResponse('Diagram not found', 404);
    }

    if (diagram.userId !== user.id && user.role !== 'admin') {
      return errorResponse('Access denied', 403);
    }

    return successResponse(diagram);
  } catch (error) {
    return errorResponse('Access denied', 401);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request);
    const diagram = findDiagramById(params.id);
    
    if (!diagram) {
      return errorResponse('Diagram not found', 404);
    }

    if (diagram.userId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const body = await request.json();
    const updatedDiagram = updateDiagram(params.id, body);

    logAudit(user.id, 'UPDATE', `diagram:${params.id}`);
    return successResponse(updatedDiagram);
  } catch (error) {
    return errorResponse('Failed to update diagram', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request);
    const diagram = findDiagramById(params.id);
    
    if (!diagram) {
      return errorResponse('Diagram not found', 404);
    }

    if (diagram.userId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const deleted = deleteDiagram(params.id);
    if (!deleted) {
      return errorResponse('Failed to delete diagram', 500);
    }

    logAudit(user.id, 'DELETE', `diagram:${params.id}`);
    return successResponse({ message: 'Diagram deleted successfully' });
  } catch (error) {
    return errorResponse('Failed to delete diagram', 500);
  }
}