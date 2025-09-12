const users = new Map(); // In-memory storage for demo

class User {
  constructor(id, username, email, role = 'user') {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role; // 'user' or 'admin'
    this.active = true;
    this.createdAt = new Date();
  }

  static findById(id) {
    return users.get(id);
  }

  static findAll() {
    return Array.from(users.values());
  }

  static create(userData) {
    const id = Date.now().toString();
    const user = new User(id, userData.username, userData.email, userData.role);
    users.set(id, user);
    return user;
  }

  update(data) {
    if (data.role) this.role = data.role;
    if (data.active !== undefined) this.active = data.active;
    return this;
  }

  isAdmin() {
    return this.role === 'admin';
  }
}

module.exports = User;