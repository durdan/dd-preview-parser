import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DiagramPreview from './DiagramPreview';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-600">Loading editor...</div>
    </div>
  )
});

export type DiagramType = 'mermaid' | 'plantuml' | 'unknown';

interface DiagramEditorProps {
  initialContent?: string;
  onContentChange?: (content: string, type: DiagramType) => void;
  onDiagramTypeChange?: (type: DiagramType) => void;
}

// PlantUML syntax detection
export const isPlantUMLDiagram = (content: string): boolean => {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const trimmedContent = content.trim();
  
  // Check for PlantUML start/end tags
  const hasStartEndTags = /@startuml|@enduml/i.test(trimmedContent);
  if (hasStartEndTags) {
    return true;
  }

  // Check for PlantUML-specific keywords
  const plantUMLKeywords = [
    // UML diagram types
    'class', 'object', 'component', 'deployment', 'package', 'node', 'folder', 'frame', 'cloud', 'database',
    'actor', 'use case', 'usecase', 'rectangle', 'interface', 'enum', 'abstract', 'annotation',
    // Activity diagrams
    'activity', 'partition', 'fork', 'end fork', 'detach', 'note', 'floating note',
    // Sequence diagrams
    'participant', 'actor', 'boundary', 'control', 'entity', 'collections', 'queue', 'alt', 'else', 'end', 'opt', 'loop', 'par', 'and', 'break', 'critical', 'group', 'activate', 'deactivate', 'destroy', 'create',
    // State diagrams
    'state', '[*]', '-->', '--', 'note right', 'note left', 'note top', 'note bottom',
    // Timing diagrams
    'clock', 'binary', 'concise', 'robust',
    // Network diagrams
    'network', 'nwdiag',
    // Archimate
    'archimate',
    // Salt
    'salt',
    // Mindmap
    'mindmap',
    // Gantt
    'gantt',
    // Git
    'gitgraph'
  ];

  const contentLower = trimmedContent.toLowerCase();
  return plantUMLKeywords.some(keyword => contentLower.includes(keyword));
};

// Mermaid syntax detection
export const isMermaidDiagram = (content: string): boolean => {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const trimmedContent = content.trim();
  const mermaidKeywords = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
    'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'gitgraph'
  ];
  
  const firstLine = trimmedContent.split('\n')[0]?.trim() || '';
  return mermaidKeywords.some(keyword => firstLine.toLowerCase().includes(keyword.toLowerCase()));
};

const DiagramEditor: React.FC<DiagramEditorProps> = ({
  initialContent = `sequenceDiagram
    Alice->>+John: Hello John, how are you?
    Alice->>+John: John, can you hear me?
    John-->>-Alice: Hi Alice, I can hear you!
    John-->>-Alice: I feel great!`,
  onContentChange,
  onDiagramTypeChange
}) => {
  const [content, setContent] = useState(initialContent);
  const [diagramType, setDiagramType] = useState<DiagramType>('mermaid');
  const editorRef = useRef<any>(null);

  // Detect diagram type based on content
  const detectDiagramType = useCallback((newContent: string): DiagramType => {
    if (isPlantUMLDiagram(newContent)) {
      return 'plantuml';
    } else if (isMermaidDiagram(newContent)) {
      return 'mermaid';
    }
    return 'unknown';
  }, []);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    const detectedType = detectDiagramType(newContent);
    setDiagramType(detectedType);
    
    onContentChange?.(newContent, detectedType);
    onDiagramTypeChange?.(detectedType);
  }, [detectDiagramType, onContentChange, onDiagramTypeChange]);

  // Get Monaco Editor language based on diagram type
  const getEditorLanguage = useCallback(() => {
    switch (diagramType) {
      case 'mermaid':
        return 'mermaid';
      case 'plantuml':
        return 'plantuml';
      default:
        return 'plaintext';
    }
  }, [diagramType]);

  // Get Monaco Editor theme
  const getEditorTheme = useCallback(() => {
    return 'vs-dark';
  }, []);

  // Monaco Editor options
  const editorOptions = {
    theme: getEditorTheme(),
    fontSize: 14,
    lineNumbers: 'on' as const,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on' as const,
    tabSize: 2,
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    acceptSuggestionOnEnter: 'on' as const,
  };

  return (
    <div className="diagram-editor bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="editor-header bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Diagram Editor
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Type: <strong>{diagramType.toUpperCase()}</strong>
          </span>
        </div>
      </div>
      
      <div className="editor-container" style={{ display: 'flex', height: '600px' }}>
        {/* Left Panel - Monaco Editor */}
        <div className="editor-input" style={{ flex: 1, borderRight: '1px solid #e5e7eb' }}>
          <MonacoEditor
            height="100%"
            language={getEditorLanguage()}
            value={content}
            onChange={handleContentChange}
            options={editorOptions}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
          />
        </div>
        
        {/* Right Panel - Diagram Preview */}
        <div className="editor-preview" style={{ flex: 1 }}>
          <div className="h-full">
            <DiagramPreview 
              content={content}
              onContentChange={handleContentChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramEditor;