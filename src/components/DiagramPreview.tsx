import React, { useState, useEffect } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { DiagramParser } from '../services/DiagramParser';
import { DiagramRenderer } from '../services/DiagramRenderer';
import { ErrorDisplay } from './ErrorDisplay';

interface DiagramPreviewProps {
  content: string;
  onContentChange: (content: string) => void;
}

export const DiagramPreview: React.FC<DiagramPreviewProps> = ({
  content,
  onContentChange
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const debouncedContent = useDebouncedValue(content, 300);

  useEffect(() => {
    const renderDiagram = async () => {
      setIsRendering(true);
      setError(null);

      try {
        const parseResult = DiagramParser.parse(debouncedContent);
        
        if (!parseResult.isValid) {
          setError(parseResult.error || 'Invalid diagram');
          return;
        }

        await DiagramRenderer.render(parseResult.parsedContent || '', 'diagram-container');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Rendering failed');
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [debouncedContent]);

  return (
    <div className="diagram-preview" style={{ display: 'flex', height: '600px' }}>
      <div style={{ flex: 1, marginRight: '16px' }}>
        <h3>Diagram Code</h3>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Enter your diagram code here..."
          style={{
            width: '100%',
            height: '500px',
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>
      
      <div style={{ flex: 1 }}>
        <h3>Preview {isRendering && <span style={{ color: '#666' }}>(updating...)</span>}</h3>
        <ErrorDisplay error={error} />
        <div
          id="diagram-container"
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '16px',
            minHeight: '400px',
            backgroundColor: '#fafafa'
          }}
        />
      </div>
    </div>
  );
};