const express = require('express');
const { NotFoundError, ConflictError } = require('../errors/customErrors');
const { validateEmail, validateRequired, validateLength, asyncHandler } = require('../utils/validators');

const router = express.Router();

// Mock database
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// GET /users
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    data: { users }
  });
}));

// GET /users/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  res.json({
    status: 'success',
    data: { user }
  });
}));

// POST /users
router.post('/', asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  
  // Validation
  validateRequired(name, 'name');
  validateLength(name, 'name', 2, 50);
  validateEmail(email);
  
  // Check for duplicate email
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }
  
  const newUser = {
    id: users.length + 1,
    name: name.trim(),
    email: email.toLowerCase().trim()
  };
  
  users.push(newUser);
  
  res.status(201).json({
    status: 'success',
    data: { user: newUser }
  });
}));

// PUT /users/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;
  
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new NotFoundError('User');
  }
  
  // Validation
  if (name !== undefined) {
    validateRequired(name, 'name');
    validateLength(name, 'name', 2, 50);
  }
  
  if (email !== undefined) {
    validateEmail(email);
    // Check for duplicate email (excluding current user)
    const existingUser = users.find(u => u.email === email && u.id !== id);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
  }
  
  // Update user
  if (name !== undefined) users[userIndex].name = name.trim();
  if (email !== undefined) users[userIndex].email = email.toLowerCase().trim();
  
  res.json({
    status: 'success',
    data: { user: users[userIndex] }
  });
}));

// DELETE /users/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    throw new NotFoundError('User');
  }
  
  users.splice(userIndex, 1);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
}));

module.exports = router;