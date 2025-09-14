import React, { useState, useEffect, useCallback } from 'react';
import { Save, Check, AlertCircle, Loader2 } from 'lucide-react';
import './DiagramEditor.css';

const DiagramEditor = ({ diagramData, onSave }) => {
  const [saveState, setSaveState] = useState('idle'); // idle, saving, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [diagramContent, setDiagramContent] = useState(diagramData || '');

  // Save function with proper state management
  const handleSave = useCallback(async () => {
    if (saveState === 'saving') return;

    setSaveState('saving');
    setErrorMessage('');

    try {
      await onSave(diagramContent);
      setSaveState('success');
      
      // Reset to idle after showing success
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (error) {
      setSaveState('error');
      setErrorMessage(error.message || 'Failed to save diagram');
    }
  }, [diagramContent, onSave, saveState]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Retry save on error
  const handleRetry = () => {
    setSaveState('idle');
    setErrorMessage('');
    handleSave();
  };

  // Get button content based on state and screen size
  const getButtonContent = () => {
    switch (saveState) {
      case 'saving':
        return (
          <>
            <Loader2 className="icon spinning" size={16} />
            <span className="button-text">Saving...</span>
          </>
        );
      case 'success':
        return (
          <>
            <Check className="icon" size={16} />
            <span className="button-text">Saved</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="icon" size={16} />
            <span className="button-text">Error</span>
          </>
        );
      default:
        return (
          <>
            <Save className="icon" size={16} />
            <span className="button-text">Save</span>
          </>
        );
    }
  };

  return (
    <div className="diagram-editor">
      <div className="editor-header">
        <h2>Diagram Editor</h2>
        
        <div className="save-section">
          <button
            className={`save-button ${saveState}`}
            onClick={handleSave}
            disabled={saveState === 'saving'}
            title="Save diagram (Ctrl+S)"
          >
            {getButtonContent()}
          </button>
          
          {saveState === 'error' && (
            <button
              className="retry-button"
              onClick={handleRetry}
              title="Retry save"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="editor-content">
        <textarea
          value={diagramContent}
          onChange={(e) => setDiagramContent(e.target.value)}
          placeholder="Enter your diagram content here..."
          className="diagram-input"
        />
      </div>

      <div className="keyboard-hint">
        Press <kbd>Ctrl+S</kbd> (or <kbd>⌘+S</kbd> on Mac) to save
      </div>
    </div>
  );
};

export default DiagramEditor;