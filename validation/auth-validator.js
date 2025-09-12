const axios = require('axios');

class AuthValidator {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.testUser = {
      email: 'test@example.com',
      password: 'testpassword123'
    };
  }

  async testLogin() {
    try {
      const response = await axios.post(`${this.baseUrl}/api/auth/login`, this.testUser);
      
      if (response.status === 200 && response.data.token) {
        return {
          test: 'Login',
          status: 'passed',
          message: 'User can login successfully'
        };
      }
      
      throw new Error('Login response invalid');
    } catch (error) {
      return {
        test: 'Login',
        status: 'failed',
        error: error.message
      };
    }
  }

  async testLogout() {
    try {
      // First login to get token
      const loginResponse = await axios.post(`${this.baseUrl}/api/auth/login`, this.testUser);
      const token = loginResponse.data.token;
      
      // Then logout
      const response = await axios.post(`${this.baseUrl}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        return {
          test: 'Logout',
          status: 'passed',
          message: 'User can logout successfully'
        };
      }
      
      throw new Error('Logout failed');
    } catch (error) {
      return {
        test: 'Logout',
        status: 'failed',
        error: error.message
      };
    }
  }

  async testSessionManagement() {
    try {
      // Login and get token
      const loginResponse = await axios.post(`${this.baseUrl}/api/auth/login`, this.testUser);
      const token = loginResponse.data.token;
      
      // Test protected route
      const response = await axios.get(`${this.baseUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        return {
          test: 'Session Management',
          status: 'passed',
          message: 'Session management works correctly'
        };
      }
      
      throw new Error('Session validation failed');
    } catch (error) {
      return {
        test: 'Session Management',
        status: 'failed',
        error: error.message
      };
    }
  }

  async testPasswordReset() {
    try {
      const response = await axios.post(`${this.baseUrl}/api/auth/reset-password`, {
        email: this.testUser.email
      });
      
      if (response.status === 200) {
        return {
          test: 'Password Reset',
          status: 'passed',
          message: 'Password reset functionality works'
        };
      }
      
      throw new Error('Password reset failed');
    } catch (error) {
      return {
        test: 'Password Reset',
        status: 'failed',
        error: error.message
      };
    }
  }

  async testUnauthorizedAccess() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/user/profile`);
      
      // Should fail without token
      if (response.status === 401) {
        return {
          test: 'Unauthorized Access',
          status: 'passed',
          message: 'Unauthorized access properly blocked'
        };
      }
      
      throw new Error('Unauthorized access not blocked');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return {
          test: 'Unauthorized Access',
          status: 'passed',
          message: 'Unauthorized access properly blocked'
        };
      }
      
      return {
        test: 'Unauthorized Access',
        status: 'failed',
        error: error.message
      };
    }
  }
}

module.exports = AuthValidator;