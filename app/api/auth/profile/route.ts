import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '../../utils/response';
import { requireAuth } from '../../utils/auth';
import { findUserById } from '../../utils/storage';

export async function GET(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);
    const user = findUserById(currentUser.id);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    return errorResponse('Access denied', 401);
  }
}