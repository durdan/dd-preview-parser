import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile } from '../UserProfile';

describe('UserProfile', () => {
  test('renders form fields', () => {
    render(<UserProfile />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create profile/i })).toBeInTheDocument();
  });

  test('shows validation error for empty name', async () => {
    render(<UserProfile />);
    
    const submitButton = screen.getByRole('button', { name: /create profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  test('updates form data on input change', () => {
    render(<UserProfile />);
    
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(nameInput).toHaveValue('John Doe');
  });

  test('creates user profile with valid data', async () => {
    render(<UserProfile />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '30' } });
    
    fireEvent.click(screen.getByRole('button', { name: /create profile/i }));

    await waitFor(() => {
      expect(screen.getByText('Current Profile:')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });
});