import React, { useState, useCallback, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
    '@startuml', '@enduml', '@startmindmap', '@endmindmap',
    '@startsalt', '@endsalt', '@startgantt', '@endgantt',
    // Class diagram keywords
    'class\\s+\\w+', 'interface\\s+\\w+', 'abstract\\s+class',
    'enum\\s+\\w+', 'package\\s+\\w+',
    // Relationship operators
    '\\|\\|--\\|\\|', '\\}\\|--\\|\\{', '\\|\\>--\\|\\>',
    '-->', '<--', '\\.\\.>', '<\\.\\.', '==>', '<==',
    // Activity diagram
    'start', 'stop', 'end', ':.*?;', 'if\\s*\\(.*?\\)',
    // Sequence diagram
    'participant\\s+\\w+', 'actor\\s+\\w+', 'boundary\\s+\\w+',
    'control\\s+\\w+', 'entity\\s+\\w+', 'database\\s+\\w+',
    // Component diagram
    'component\\s+\\w+', 'node\\s+\\w+',
    // State diagram
    'state\\s+\\w+', '\\[\\*\\]'
  ];

  const keywordPattern = new RegExp(plantUMLKeywords.join('|'), 'i');
  return keywordPattern.test(trimmedContent);
};

// Mermaid syntax detection
export const isMermaidDiagram = (content: string): boolean => {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const trimmedContent = content.trim();
  
  // Mermaid diagram type keywords
  const mermaidKeywords = [
    'graph\\s+(TD|TB|BT|RL|LR)',
    'flowchart\\s+(TD|TB|BT|RL|LR)',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'journey',
    'gantt',
    'pie\\s+title',
    'gitgraph',
    'mindmap',
    'timeline'
  ];

  const keywordPattern = new RegExp(`^\\s*(${mermaidKeywords.join('|')})`, 'im');
  return keywordPattern.test(trimmedContent);
};

// Determine diagram type
export const detectDiagramType = (content: string): DiagramType => {
  if (!content || content.trim().length === 0) {
    return 'unknown';
  }

  // PlantUML has priority if it has explicit tags
  if (content.includes('@startuml') || content.includes('@enduml')) {
    return 'plantuml';
  }

  // Check Mermaid first (more specific patterns)
  if (isMermaidDiagram(content)) {
    return 'mermaid';
  }

  // Then check PlantUML
  if (isPlantUMLDiagram(content)) {
    return 'plantuml';
  }

  return 'unknown';
};

// Custom PlantUML syntax highlighting
const PlantUMLHighlighter: React.FC<{ children: string }> = ({ children }) => {
  const highlightedCode = useMemo(() => {
    return children
      .replace(/(@startuml|@enduml|@startmindmap|@endmindmap)/g, '<span style="color: #569cd6;">$1</span>')
      .replace(/(class|interface|abstract|enum|package|participant|actor|component|node|state)\s+(\w+)/g, 
               '<span style="color: #4ec9b0;">$1</span> <span style="color: #dcdcaa;">$2</span>')
      .replace(/(-->|<--|\.\.>|<\.\.|==>|<==|\|\|--\|\||\}\|--\|\{)/g, '<span style="color: #c586c0;">$1</span>')
      .replace(/(:.*?;)/g, '<span style="color: #ce9178;">$1</span>')
      .replace(/(if\s*\(.*?\)|start|stop|end)/g, '<span style="color: #569cd6;">$1</span>');
  }, [children]);

  return (
    <pre style={{ 
      backgroundColor: '#1e1e1e', 
      color: '#d4d4d4', 
      padding: '1rem',
      borderRadius: '4px',
      overflow: 'auto'
    }}>
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  );
};

export const DiagramEditor: React.FC<DiagramEditorProps> = ({
  initialContent = '',
  onContentChange,
  onDiagramTypeChange
}) => {
  const [content, setContent] = useState(initialContent);
  const [diagramType, setDiagramType] = useState<DiagramType>(() => 
    detectDiagramType(initialContent)
  );

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    
    const detectedType = detectDiagramType(newContent);
    
    if (detectedType !== diagramType) {
      setDiagramType(detectedType);
      onDiagramTypeChange?.(detectedType);
    }
    
    onContentChange?.(newContent, detectedType);
  }, [diagramType, onContentChange, onDiagramTypeChange]);

  const renderSyntaxHighlighter = () => {
    if (diagramType === 'plantuml') {
      return <PlantUMLHighlighter>{content}</PlantUMLHighlighter>;
    } else if (diagramType === 'mermaid') {
      return (
        <SyntaxHighlighter
          language="mermaid"
          style={tomorrow}
          customStyle={{
            margin: 0,
            borderRadius: '4px'
          }}
        >
          {content}
        </SyntaxHighlighter>
      );
    } else {
      return (
        <SyntaxHighlighter
          language="text"
          style={tomorrow}
          customStyle={{
            margin: 0,
            borderRadius: '4px'
          }}
        >
          {content}
        </SyntaxHighlighter>
      );
    }
  };

  return (
    <div className="diagram-editor">
      <div className="editor-header">
        <span className="diagram-type-indicator">
          Type: <strong>{diagramType.toUpperCase()}</strong>
        </span>
      </div>
      
      <div className="editor-container" style={{ display: 'flex', gap: '1rem' }}>
        <div className="editor-input" style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Enter your diagram code here..."
            style={{
              width: '100%',
              height: '400px',
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <div className="editor-preview" style={{ flex: 1 }}>
          <h4>Syntax Highlighting Preview:</h4>
          {renderSyntaxHighlighter()}
        </div>
      </div>
    </div>
  );
};

export default DiagramEditor;