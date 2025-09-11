import React, { useState, useEffect } from 'react';
import MarkdownEditor from './MarkdownEditor';
import MarkdownRenderer from './MarkdownRenderer';
import DocumentationService from '../services/DocumentationService';

const DiagramDocumentation = ({ diagramId, mode = 'view' }) => {
  const [documentation, setDocumentation] = useState({ content: '', lastModified: null });
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [docService] = useState(() => new DocumentationService());

  useEffect(() => {
    if (diagramId) {
      const doc = docService.getDocumentation(diagramId);
      setDocumentation(doc);
    }
  }, [diagramId, docService]);

  const handleSave = (content) => {
    try {
      const savedDoc = docService.saveDocumentation(diagramId, content);
      setDocumentation(savedDoc);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save documentation:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!diagramId) {
    return (
      <div className="documentation-placeholder">
        Select a diagram to view or edit its documentation.
      </div>
    );
  }

  return (
    <div className="diagram-documentation">
      <div className="documentation-header">
        <h3>Documentation for Diagram: {diagramId}</h3>
        {documentation.lastModified && (
          <span className="last-modified">
            Last modified: {new Date(documentation.lastModified).toLocaleString()}
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="editing-mode">
          <MarkdownEditor
            initialContent={documentation.content}
            onSave={handleSave}
            diagramId={diagramId}
          />
          <button onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      ) : (
        <div className="viewing-mode">
          <div className="view-actions">
            <button onClick={handleEdit} className="edit-button">
              Edit Documentation
            </button>
          </div>
          
          {documentation.content ? (
            <MarkdownRenderer content={documentation.content} />
          ) : (
            <div className="empty-documentation">
              <p>No documentation available for this diagram.</p>
              <button onClick={handleEdit} className="add-docs-button">
                Add Documentation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagramDocumentation;