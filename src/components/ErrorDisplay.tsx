import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="error-display" style={{
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '4px',
      padding: '12px',
      margin: '8px 0',
      color: '#c33'
    }}>
      <strong>Error:</strong> {error}
    </div>
  );
};