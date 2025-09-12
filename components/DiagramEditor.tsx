'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDiagram } from '../hooks/useDiagram';
import { DiagramData, ValidationError } from '../types/diagram';

interface DiagramEditorProps {
  diagramId?: string;
  onSave?: (diagram: DiagramData) => void;
  onError?: (error: string) => void;
}

export default function DiagramEditor({ 
  diagramId, 
  onSave, 
  onError 
}: DiagramEditorProps) {
  const [diagramData, setDiagramData] = useState<DiagramData>({
    id: '',
    name: '',
    data: {},
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    loading,
    error,
    saveDiagram,
    loadDiagram,
    validateDiagram,
    clearError
  } = useDiagram();

  // Load diagram on mount
  useEffect(() => {
    if (diagramId) {
      loadDiagramData();
    }
  }, [diagramId]);

  // Real-time validation with debounce
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timeoutId = setTimeout(async () => {
      try {
        const errors = await validateDiagram(diagramData);
        setValidationErrors(errors);
      } catch (err) {
        console.warn('Validation failed:', err);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [diagramData, hasUnsavedChanges, validateDiagram]);

  const loadDiagramData = async () => {
    if (!diagramId) return;
    
    try {
      const diagram = await loadDiagram(diagramId);
      setDiagramData(diagram);
      setHasUnsavedChanges(false);
      setValidationErrors([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load diagram';
      onError?.(errorMessage);
    }
  };

  const handleSave = async () => {
    try {
      clearError();
      
      // Final validation before save
      const errors = await validateDiagram(diagramData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      const savedDiagram = await saveDiagram(diagramData);
      setDiagramData(savedDiagram);
      setHasUnsavedChanges(false);
      setValidationErrors([]);
      onSave?.(savedDiagram);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save diagram';
      onError?.(errorMessage);
    }
  };

  const handleDataChange = useCallback((newData: Partial<DiagramData>) => {
    setDiagramData(prev => ({ ...prev, ...newData }));
    setHasUnsavedChanges(true);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleDataChange({ name: e.target.value });
  };

  const handleDiagramDataChange = (data: any) => {
    handleDataChange({ data });
  };

  return (
    <div className="diagram-editor">
      <div className="editor-header">
        <input
          type="text"
          value={diagramData.name}
          onChange={handleNameChange}
          placeholder="Diagram name"
          className="diagram-name-input"
          disabled={loading}
        />
        
        <div className="editor-actions">
          {hasUnsavedChanges && (
            <span className="unsaved-indicator">Unsaved changes</span>
          )}
          
          <button
            onClick={handleSave}
            disabled={loading || validationErrors.length > 0}
            className="save-button"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h4>Validation Errors:</h4>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index} className="error-item">
                {error.field}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Global Error */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {/* Diagram Canvas */}
      <div className="diagram-canvas">
        <DiagramCanvas
          data={diagramData.data}
          onChange={handleDiagramDataChange}
          disabled={loading}
        />
      </div>
    </div>
  );
}

// Simple diagram canvas component
function DiagramCanvas({ 
  data, 
  onChange, 
  disabled 
}: { 
  data: any; 
  onChange: (data: any) => void; 
  disabled: boolean;
}) {
  return (
    <div className="canvas-container">
      <textarea
        value={JSON.stringify(data, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(parsed);
          } catch {
            // Invalid JSON, don't update
          }
        }}
        disabled={disabled}
        className="diagram-data-input"
        rows={20}
        cols={80}
      />
    </div>
  );
}