import { verifyToken } from '../../../lib/auth';
import { findUserById, updateUser, sanitizeUser } from '../../../lib/db';
import { validateName, ValidationError } from '../../../lib/validation';

async function getAuthenticatedUser(req) {
  const token = req.cookies['auth-token'];
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  return findUserById(decoded.userId);
}

export default async function handler(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ user: sanitizeUser(user) });
    }

    if (req.method === 'PUT') {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const validName = validateName(name);
      const updatedUser = updateUser(user.id, { name: validName });

      return res.status(200).json({
        message: 'Profile updated successfully',
        user: sanitizeUser(updatedUser)
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}