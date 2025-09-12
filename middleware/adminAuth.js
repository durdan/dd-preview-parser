const User = require('../models/User');

function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = User.findById(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  if (!user.isAdmin()) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  req.user = user;
  next();
}

module.exports = { requireAdmin };