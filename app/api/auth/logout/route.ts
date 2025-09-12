import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '../../utils/response';
import { requireAuth } from '../../utils/auth';

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
    // In production, you might want to blacklist the token
    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    return errorResponse('Logout failed', 401);
  }
}