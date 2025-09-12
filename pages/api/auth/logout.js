import { createLogoutCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cookie = createLogoutCookie();
    res.setHeader('Set-Cookie', `${cookie.name}=${cookie.value}; HttpOnly; Secure=${cookie.secure}; SameSite=${cookie.sameSite}; Max-Age=${cookie.maxAge}; Path=${cookie.path}`);

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}