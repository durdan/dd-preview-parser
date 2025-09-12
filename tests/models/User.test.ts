import { User } from '../../src/models/User';
import { connectDatabase, disconnectDatabase } from '../../src/config/database';

describe('User Model', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnectDatabase();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should create a valid user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).toBe(userData.password);
    expect(savedUser.createdAt).toBeDefined();
  });

  it('should reject invalid email', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'password123'
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });

  it('should reject short password', async () => {
    const userData = {
      email: 'test@example.com',
      password: '123'
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });

  it('should enforce unique email', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    await new User(userData).save();
    const duplicateUser = new User(userData);
    await expect(duplicateUser.save()).rejects.toThrow();
  });
});