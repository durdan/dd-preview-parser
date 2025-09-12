import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validateRequired } from '../utils/response';
import { requireAuth } from '../utils/auth';
import { createDiagram, findDiagramsByUserId, logAudit } from '../utils/storage';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const diagrams = findDiagramsByUserId(user.id);
    return successResponse(diagrams);
  } catch (error) {
    return errorResponse('Access denied', 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    
    const validation = validateRequired(body, ['title', 'content', 'type']);
    if (validation) {
      return errorResponse(validation);
    }

    if (!['flowchart', 'sequence', 'class'].includes(body.type)) {
      return errorResponse('Invalid diagram type');
    }

    const diagram = createDiagram({
      userId: user.id,
      title: body.title,
      content: body.content,
      type: body.type
    });

    logAudit(user.id, 'CREATE', `diagram:${diagram.id}`);
    return successResponse(diagram, 201);
  } catch (error) {
    return errorResponse('Failed to create diagram', 500);
  }
}