import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import DiagramPreview from './DiagramPreview';
import { DiagramParser } from '../utils/DiagramParser';
import { useOptimizedCallback } from '../utils/PerformanceOptimizer';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { registerDiagramLanguage, DIAGRAM_LANGUAGE, MONACO_OPTIONS } from './MonacoConfig';
import { EditorState } from '../types/diagram';

const INITIAL_CONTENT = `graph TD
    A[Begin Process] --> B[Validate Input]
    B --> C{Is Valid?}
    C -->|Yes| D[Process Data]
    C -->|No| E[Complete]
    D --> E
    
    style A fill:#e1f5fe
    style E fill:#c8e6c9
    style C fill:#fff3e0`;

const DiagramEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(() => {
    // Since we're using Mermaid syntax now, we'll set it as valid by default
    return {
      content: INITIAL_CONTENT,
      parsedDiagram: { nodes: [], connections: [], errors: [] },
      isValid: true
    };
  });

  const layout = useResponsiveLayout();

  // Helper function to detect if content is a Mermaid diagram
  const isMermaidDiagram = (content: string): boolean => {
    const mermaidKeywords = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
      'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'gitgraph'
    ];
    
    const firstLine = content.split('\n')[0]?.trim() || '';
    return mermaidKeywords.some(keyword => firstLine.toLowerCase().includes(keyword.toLowerCase()));
  };

  // Optimized content change handler
  const handleContentChange = useOptimizedCallback(
    (value: string | undefined) => {
      if (value === undefined) return;
      
      // Check if it's a Mermaid diagram
      const isMermaid = isMermaidDiagram(value);
      
      if (isMermaid) {
        // For Mermaid diagrams, assume valid (Mermaid will handle validation)
        setEditorState({
          content: value,
          parsedDiagram: { nodes: [], connections: [], errors: [] },
          isValid: true
        });
      } else {
        // For custom syntax, use the parser
        const parsedDiagram = DiagramParser.parse(value);
        setEditorState({
          content: value,
          parsedDiagram,
          isValid: parsedDiagram.errors.length === 0
        });
      }
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Diagram Editor</h1>
            <p className="text-blue-100">Create beautiful diagrams with real-time preview</p>
          </div>
          
          {/* Main Content */}
          <div className={`grid ${layout.isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-0 min-h-[600px]`}>
            {/* Editor Panel */}
            <div className="border-r border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Diagram Code</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  editorState.isValid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {editorState.isValid ? '✓ Valid' : '⚠ Errors'}
                </div>
              </div>
              <div className="h-[500px]">
                <Editor
                  height="100%"
                  language={DIAGRAM_LANGUAGE}
                  value={editorState.content}
                  onChange={handleContentChange}
                  options={MONACO_OPTIONS}
                />
              </div>
            </div>
            
            {/* Preview Panel */}
            <div className="bg-white">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Live Preview</h2>
                <div className="text-sm text-gray-600">
                  {editorState.parsedDiagram.nodes.length} nodes, {editorState.parsedDiagram.connections.length} connections
                </div>
              </div>
              <div className="h-[500px] p-4">
                <DiagramPreview 
                  content={editorState.content}
                  onContentChange={(newContent) => {
                    setEditorState(prev => ({
                      ...prev,
                      content: newContent
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramEditor;