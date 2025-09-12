import { User } from '../models/User';
import { CreateUserInput, IUser } from '../types';
import { Types } from 'mongoose';

export class UserService {
  static async createUser(userData: CreateUserInput): Promise<IUser> {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async findUserById(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid user ID');
    }
    return await User.findById(id);
  }

  static async findUserByEmail(email: string): Promise<IUser | null> {
    if (!email || typeof email !== 'string') {
      throw new Error('Valid email is required');
    }
    return await User.findOne({ email: email.toLowerCase() });
  }

  static async deleteUser(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid user ID');
    }
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }
}