import React, { useState } from 'react';
import { Diagram } from '../types/dashboard';
import { formatRelativeTime } from '../utils/diagramUtils';

interface DiagramCardProps {
  diagram: Diagram;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isPublic: boolean) => void;
}

export const DiagramCard: React.FC<DiagramCardProps> = ({
  diagram,
  onDelete,
  onToggleVisibility
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this diagram?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(diagram.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVisibilityToggle = () => {
    onToggleVisibility(diagram.id, !diagram.isPublic);
  };

  return (
    <div 
      className="diagram-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="card-thumbnail">
        {diagram.thumbnail ? (
          <img src={diagram.thumbnail} alt={diagram.title} />
        ) : (
          <div className="thumbnail-placeholder">
            <span>📊</span>
          </div>
        )}
        
        {showActions && (
          <div className="card-actions">
            <button
              onClick={() => window.open(`/diagram/${diagram.id}`, '_blank')}
              className="action-btn view-btn"
              title="Open diagram"
            >
              👁️
            </button>
            <button
              onClick={handleVisibilityToggle}
              className={`action-btn visibility-btn ${diagram.isPublic ? 'public' : 'private'}`}
              title={diagram.isPublic ? 'Make private' : 'Make public'}
            >
              {diagram.isPublic ? '🌐' : '🔒'}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="action-btn delete-btn"
              title="Delete diagram"
            >
              {isDeleting ? '⏳' : '🗑️'}
            </button>
          </div>
        )}
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{diagram.title}</h3>
        {diagram.description && (
          <p className="card-description">{diagram.description}</p>
        )}
        
        <div className="card-metadata">
          <div className="metadata-row">
            <span className={`visibility-badge ${diagram.isPublic ? 'public' : 'private'}`}>
              {diagram.isPublic ? 'Public' : 'Private'}
            </span>
            <span className="update-time">
              {formatRelativeTime(diagram.updatedAt)}
            </span>
          </div>
          
          <div className="metadata-row">
            <span className="node-count">{diagram.nodeCount} nodes</span>
            <span className="edge-count">{diagram.edgeCount} edges</span>
          </div>
        </div>
      </div>
    </div>
  );
};