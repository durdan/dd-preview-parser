import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validateRequired, validateEmail } from '../../utils/response';
import { createUser, findUserByEmail } from '../../utils/storage';
import { generateToken } from '../../utils/auth';
import { RegisterRequest } from '../../types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    
    const validation = validateRequired(body, ['email', 'password', 'name']);
    if (validation) {
      return errorResponse(validation);
    }

    if (!validateEmail(body.email)) {
      return errorResponse('Invalid email format');
    }

    if (body.password.length < 6) {
      return errorResponse('Password must be at least 6 characters');
    }

    if (findUserByEmail(body.email)) {
      return errorResponse('User already exists', 409);
    }

    const user = createUser({
      email: body.email,
      name: body.name,
      role: 'user'
    });

    const token = generateToken(user);

    return successResponse({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    }, 201);
  } catch (error) {
    return errorResponse('Registration failed', 500);
  }
}