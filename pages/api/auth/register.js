import { hashPassword, generateToken, createAuthCookie } from '../../../lib/auth';
import { createUser, findUserByEmail, sanitizeUser } from '../../../lib/db';
import { validateEmail, validatePassword, validateName, ValidationError } from '../../../lib/validation';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Validate input
    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);
    const validName = validateName(name);

    // Check if user already exists
    if (findUserByEmail(validEmail)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(validPassword);
    const user = createUser({
      email: validEmail,
      password: hashedPassword,
      name: validName
    });

    // Generate token and set cookie
    const token = generateToken(user.id);
    const cookie = createAuthCookie(token);
    
    res.setHeader('Set-Cookie', `${cookie.name}=${cookie.value}; HttpOnly; Secure=${cookie.secure}; SameSite=${cookie.sameSite}; Max-Age=${cookie.maxAge}; Path=${cookie.path}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: sanitizeUser(user)
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}