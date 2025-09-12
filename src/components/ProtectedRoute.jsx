import React from 'react';
import authService from '../services/authService.js';

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    window.location.href = '/login';
    return <div>Redirecting to login...</div>;
  }

  return children;
};

export default ProtectedRoute;