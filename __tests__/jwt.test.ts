import { verifyToken, createToken, extractTokenFromHeader, extractTokenFromCookie } from '../lib/jwt';

// Mock environment variable
process.env.JWT_SECRET = 'test-secret-key';

describe('JWT Utils', () => {
  const mockPayload = {
    userId: '123',
    email: 'test@example.com'
  };

  describe('createToken and verifyToken', () => {
    it('should create and verify a valid token', async () => {
      const token = await createToken(mockPayload);
      const decoded = await verifyToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('should reject invalid token', async () => {
      await expect(verifyToken('invalid-token')).rejects.toThrow('Invalid token');
    });

    it('should reject empty token', async () => {
      await expect(verifyToken('')).rejects.toThrow('Invalid token');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = extractTokenFromHeader('Bearer abc123');
      expect(token).toBe('abc123');
    });

    it('should return null for invalid header format', () => {
      expect(extractTokenFromHeader('Invalid abc123')).toBeNull();
      expect(extractTokenFromHeader('Bearer')).toBe('');
      expect(extractTokenFromHeader(null)).toBeNull();
    });
  });

  describe('extractTokenFromCookie', () => {
    it('should extract token from cookie string', () => {
      const token = extractTokenFromCookie('token=abc123; other=value');
      expect(token).toBe('abc123');
    });

    it('should return null when token cookie not found', () => {
      expect(extractTokenFromCookie('other=value')).toBeNull();
      expect(extractTokenFromCookie(null)).toBeNull();
      expect(extractTokenFromCookie('')).toBeNull();
    });
  });
});