class SessionContext {
  constructor() {
    this.currentUser = null;
  }

  setUser(user) {
    if (!user || !user.id) {
      throw new Error('Invalid user object');
    }
    this.currentUser = user;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  requireAuthentication() {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
  }
}

module.exports = SessionContext;