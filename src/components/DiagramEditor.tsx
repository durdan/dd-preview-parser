'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Save, FileDown, Loader2 } from 'lucide-react';
import DiagramPreview from './DiagramPreview';
import { diagramService } from '../../lib/diagramService';
import { useAuth } from '../../lib/hooks/useAuth';
import { ThumbnailGenerator } from '../../lib/thumbnailGenerator';

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
  initialDiagram?: {
    id?: string;
    title: string;
    content: string;
  };
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
  initialDiagram,
  onContentChange,
  onDiagramTypeChange
}) => {
  const [content, setContent] = useState(initialDiagram?.content || initialContent);
  const [diagramType, setDiagramType] = useState<DiagramType>('mermaid');
  const [isSaving, setIsSaving] = useState(false);
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [saveAsTitle, setSaveAsTitle] = useState('');
  const [currentDiagram, setCurrentDiagram] = useState(initialDiagram);
  
  const editorRef = useRef<any>(null);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

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
  const handleContentChange = useCallback((newContent: string | undefined) => {
    const content = newContent || '';
    setContent(content);
    const detectedType = detectDiagramType(content);
    setDiagramType(detectedType);
    
    onContentChange?.(content, detectedType);
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

  // Save functionality
  const handleSave = useCallback(async () => {
    if (authLoading) return;
    
    if (!user) {
      // Redirect to login
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!content.trim()) {
      alert('Cannot save empty diagram');
      return;
    }

    setIsSaving(true);
    try {
      // Generate thumbnail
      const thumbnail = ThumbnailGenerator.generateThumbnail(content, diagramType);
      
      const savedDiagram = await diagramService.saveDiagram({
        id: currentDiagram?.id,
        title: currentDiagram?.title || 'Untitled Diagram',
        content,
        type: diagramType,
        thumbnail
      });

      setCurrentDiagram(savedDiagram);
      alert('Diagram saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save diagram: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  }, [content, currentDiagram, diagramType, user, authLoading, router]);

  const handleSaveAs = useCallback(async () => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!content.trim()) {
      alert('Cannot save empty diagram');
      return;
    }

    if (!saveAsTitle.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      // Generate thumbnail
      const thumbnail = ThumbnailGenerator.generateThumbnail(content, diagramType);
      
      const savedDiagram = await diagramService.saveDiagram({
        title: saveAsTitle,
        content,
        type: diagramType,
        thumbnail
      });

      setCurrentDiagram(savedDiagram);
      setSaveAsDialogOpen(false);
      setSaveAsTitle('');
      alert('Diagram saved successfully!');
    } catch (error) {
      console.error('Save as error:', error);
      alert('Failed to save diagram: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  }, [content, saveAsTitle, diagramType, user, authLoading, router]);

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
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Type: <strong>{diagramType.toUpperCase()}</strong>
            </span>
            <button
              onClick={handleSave}
              disabled={isSaving || authLoading}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              {currentDiagram?.id ? 'Update' : 'Save'}
            </button>
            <button
              onClick={() => setSaveAsDialogOpen(true)}
              disabled={isSaving || authLoading}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                    <FileDown className="w-3 h-3" />
              Save As
            </button>
          </div>
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

      {/* Save As Dialog */}
      {saveAsDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Diagram As</h3>
            <input
              type="text"
              value={saveAsTitle}
              onChange={(e) => setSaveAsTitle(e.target.value)}
              placeholder="Enter diagram title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setSaveAsDialogOpen(false);
                  setSaveAsTitle('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAs}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagramEditor;