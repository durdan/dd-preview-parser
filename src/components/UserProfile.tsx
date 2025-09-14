import React from 'react';
import { useUserSession } from '../contexts/UserSessionContext';

export const UserProfile: React.FC = () => {
  const { user, logout, isAuthenticated } = useUserSession();

  if (!isAuthenticated || !user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <p>User ID: {user.id}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};