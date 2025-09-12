class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = this.token ? this.parseTokenPayload(this.token) : null;
  }

  parseTokenPayload(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.sub, email: payload.email, name: payload.name };
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return !!this.token && !this.isTokenExpired();
  }

  isTokenExpired() {
    if (!this.token) return true;
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  getAuthHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  login(token) {
    this.token = token;
    this.user = this.parseTokenPayload(token);
    localStorage.setItem('authToken', token);
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
  }

  getCurrentUser() {
    return this.user;
  }
}

export default new AuthService();