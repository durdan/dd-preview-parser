import React, { useState, FormEvent } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserFormData } from '../types/User';

interface UserProfileProps {
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user, loading, error, updateUser, toggleActiveStatus, clearError } = useUserProfile();
  
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age?.toString() || '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateUser(formData);
  };

  const handleInputChange = (field: keyof UserFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) clearError();
  };

  return (
    <div className={`user-profile ${className}`}>
      <h2>User Profile</h2>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            disabled={loading}
            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            disabled={loading}
            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="age">Age:</label>
          <input
            id="age"
            type="number"
            value={formData.age}
            onChange={handleInputChange('age')}
            disabled={loading}
            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : user ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>

      {user && (
        <div className="user-display">
          <h3>Current Profile:</h3>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Age:</strong> {user.age}</p>
          <p>
            <strong>Status:</strong> 
            <span style={{ color: user.isActive ? 'green' : 'red' }}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
          <button onClick={toggleActiveStatus} style={{ marginTop: '0.5rem' }}>
            {user.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )}
    </div>
  );
};