import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import DiagramPreview from './DiagramPreview';
import { DiagramParser } from '../utils/DiagramParser';
import { useOptimizedCallback } from '../utils/PerformanceOptimizer';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { registerDiagramLanguage, DIAGRAM_LANGUAGE, MONACO_OPTIONS } from './MonacoConfig';
import { EditorState } from '../types/diagram';

const INITIAL_CONTENT = `// Diagram Editor - Define your flowchart
start: Begin Process (start)
process1: Validate Input (process)
decision1: Is Valid? (decision)
process2: Process Data (process)
end: Complete (end)

// Connections
start -> process1
process1 -> decision1
decision1 -> process2 [Yes]
decision1 -> end [No]
process2 -> end`;

const DiagramEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(() => {
    const parsed = DiagramParser.parse(INITIAL_CONTENT);
    return {
      content: INITIAL_CONTENT,
      parsedDiagram: parsed,
      isValid: parsed.errors.length === 0
    };
  });

  const layout = useResponsiveLayout();

  // Optimized content change handler
  const handleContentChange = useOptimizedCallback(
    (value: string | undefined) => {
      if (value === undefined) return;
      
      const parsedDiagram = DiagramParser.parse(value);
      setEditorState({
        content: value,
        parsedDiagram,
        isValid: parsedDiagram.errors.length === 0
      });
    },
    [],
    300 // 300ms debounce
  );

  // Register Monaco language on mount
  useEffect(() => {
    registerDiagramLanguage();
  }, []);

  const editorStyle: React.CSSProperties = {
    height: layout.splitOrientation === 'vertical' ? '50vh' : '100vh',
    width: layout.splitOrientation === 'horizontal' ? '50%' : '100%',
  };

  const previewStyle: React.CSSProperties = {
    height: layout.splitOrientation === 'vertical' ? '50vh' : '100vh',
    width: layout.splitOrientation === 'horizontal' ? '50%' : '100%',
  };

  return (
    <div className={`diagram-editor ${layout.splitOrientation}`}>
      <div className="editor-panel" style={editorStyle}>
        <div className="editor-header">
          <h2>Diagram Code</h2>
          <div className={`status-indicator ${editorState.isValid ? 'valid' : 'invalid'}`}>
            {editorState.isValid ? '✓ Valid' : '⚠ Errors'}
          </div>
        </div>
        <Editor
          height="calc(100% - 60px)"
          language={DIAGRAM_LANGUAGE}
          value={editorState.content}
          onChange={handleContentChange}
          options={MONACO_OPTIONS}
        />
      </div>
      
      <div className="preview-panel" style={previewStyle}>
        <div className="preview-header">
          <h2>Preview</h2>
          <div className="stats">
            {editorState.parsedDiagram.nodes.length} nodes, {editorState.parsedDiagram.connections.length} connections
          </div>
        </div>
        <DiagramPreview 
          diagram={editorState.parsedDiagram}
          className="preview-content"
        />
      </div>
    </div>
  );
};

export default DiagramEditor;