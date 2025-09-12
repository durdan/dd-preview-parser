import { UserService } from '../../src/services/userService';
import { connectDatabase, disconnectDatabase } from '../../src/config/database';
import { User } from '../../src/models/User';

describe('UserService', () => {
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

  it('should create a user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await UserService.createUser(userData);
    expect(user.email).toBe(userData.email);
    expect(user._id).toBeDefined();
  });

  it('should find user by email', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    await UserService.createUser(userData);
    const foundUser = await UserService.findUserByEmail(userData.email);
    
    expect(foundUser).toBeTruthy();
    expect(foundUser?.email).toBe(userData.email);
  });

  it('should reject invalid user ID', async () => {
    await expect(UserService.findUserById('invalid-id')).rejects.toThrow('Invalid user ID');
  });

  it('should handle duplicate email', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    await UserService.createUser(userData);
    await expect(UserService.createUser(userData)).rejects.toThrow('Email already exists');
  });
});