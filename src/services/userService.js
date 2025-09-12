import apiClient from './apiClient.js';

export class UserService {
  async getUserProfile() {
    return apiClient.get('/user/profile');
  }

  async updateProfile(profileData) {
    if (!profileData.email) throw new Error('Email is required');
    return apiClient.put('/user/profile', profileData);
  }

  async changePassword(passwordData) {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      throw new Error('Current and new passwords are required');
    }
    return apiClient.put('/user/password', passwordData);
  }

  async deleteAccount() {
    return apiClient.delete('/user/account');
  }
}

export default new UserService();