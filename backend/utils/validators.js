const { ValidationError } = require('../errors/customErrors');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    throw new ValidationError('Email is required', 'email');
  }
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }
};

const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
};

const validateLength = (value, fieldName, min, max) => {
  if (value.length < min) {
    throw new ValidationError(`${fieldName} must be at least ${min} characters`, fieldName);
  }
  if (max && value.length > max) {
    throw new ValidationError(`${fieldName} must not exceed ${max} characters`, fieldName);
  }
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  validateEmail,
  validateRequired,
  validateLength,
  asyncHandler
};