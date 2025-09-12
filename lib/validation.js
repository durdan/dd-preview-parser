export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
  
  return email.toLowerCase().trim();
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required');
  }
  
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }
  
  return password;
}

export function validateName(name) {
  if (!name || typeof name !== 'string') {
    throw new ValidationError('Name is required');
  }
  
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    throw new ValidationError('Name must be at least 2 characters long');
  }
  
  return trimmed;
}