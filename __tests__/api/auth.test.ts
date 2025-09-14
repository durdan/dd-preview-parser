import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/auth/[...nextauth]';

// Mock NextAuth
jest.mock('next-auth', () => {
  return jest.fn(() => (req: any, res: any) => {
    res.status(200).json({ message: 'NextAuth handler' });
  });
});

describe('/api/auth/[...nextauth]', () => {
  it('should handle auth requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { nextauth: ['signin'] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });
});