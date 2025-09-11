import React, { useState, useCallback } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { MarkdownValidator } from '../utils/MarkdownValidator';

const MarkdownEditor = ({ 
  initialContent = '', 
  onSave, 
  onContentChange,
  diagramId 
}) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const handleContentChange = useCallback((e) => {
    const newContent = e.target.value;
    
    try {
      MarkdownValidator.validateContent(newContent);
      const sanitized = MarkdownValidator.sanitizeContent(newContent);
      setContent(sanitized);
      setError('');
      
      if (onContentChange) {
        onContentChange(sanitized);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [onContentChange]);

  const handleSave = useCallback(() => {
    if (error) return;
    
    try {
      if (onSave) {
        onSave(content, diagramId);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [content, diagramId, error, onSave]);

  return (
    <div className="markdown-editor">
      <div className="editor-toolbar">
        <button 
          onClick={() => setIsPreview(!isPreview)}
          className="toggle-preview"
        >
          {isPreview ? 'Edit' : 'Preview'}
        </button>
        <button 
          onClick={handleSave}
          disabled={!!error}
          className="save-button"
        >
          Save
        </button>
      </div>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      <div className="editor-content">
        {isPreview ? (
          <MarkdownRenderer content={content} className="preview-pane" />
        ) : (
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Enter your diagram documentation in Markdown..."
            className="editor-textarea"
            rows={20}
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;