import { verifyPassword, generateToken, createAuthCookie } from '../../../lib/auth';
import { findUserByEmail, sanitizeUser } from '../../../lib/db';
import { validateEmail, ValidationError } from '../../../lib/validation';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    const validEmail = validateEmail(email);
    
    if (!password) {
      throw new ValidationError('Password is required');
    }

    // Find user
    const user = findUserByEmail(validEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token and set cookie
    const token = generateToken(user.id);
    const cookie = createAuthCookie(token);
    
    res.setHeader('Set-Cookie', `${cookie.name}=${cookie.value}; HttpOnly; Secure=${cookie.secure}; SameSite=${cookie.sameSite}; Max-Age=${cookie.maxAge}; Path=${cookie.path}`);

    res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user)
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}