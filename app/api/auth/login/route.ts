import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validateRequired, validateEmail } from '../../utils/response';
import { findUserByEmail } from '../../utils/storage';
import { generateToken } from '../../utils/auth';
import { AuthRequest } from '../../types';

export async function POST(request: NextRequest) {
  try {
    const body: AuthRequest = await request.json();
    
    const validation = validateRequired(body, ['email', 'password']);
    if (validation) {
      return errorResponse(validation);
    }

    if (!validateEmail(body.email)) {
      return errorResponse('Invalid email format');
    }

    const user = findUserByEmail(body.email);
    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // In production, compare hashed passwords
    const token = generateToken(user);

    return successResponse({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    });
  } catch (error) {
    return errorResponse('Login failed', 500);
  }
}