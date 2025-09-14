import React, { useState, useEffect } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { DiagramParser } from '../services/DiagramParser';
import { DiagramRenderer } from '../services/DiagramRenderer';
import { ErrorDisplay } from './ErrorDisplay';
import { ParsedDiagram } from '../types/diagram';

// Helper function to detect if content is a Mermaid diagram
const isMermaidDiagram = (content: string): boolean => {
  const mermaidKeywords = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
    'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'gitgraph'
  ];
  
  const firstLine = content.split('\n')[0]?.trim() || '';
  return mermaidKeywords.some(keyword => firstLine.toLowerCase().includes(keyword.toLowerCase()));
};

// Helper function to detect if content is a PlantUML diagram
const isPlantUMLDiagram = (content: string): boolean => {
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
    'class', 'object', 'component', 'deployment', 'package', 'node', 'folder', 'frame', 'cloud', 'database',
    'actor', 'use case', 'usecase', 'rectangle', 'interface', 'enum', 'abstract', 'annotation',
    'activity', 'partition', 'fork', 'end fork', 'detach', 'note', 'floating note',
    'participant', 'boundary', 'control', 'entity', 'collections', 'queue', 'alt', 'else', 'end', 'opt', 'loop', 'par', 'and', 'break', 'critical', 'group', 'activate', 'deactivate', 'destroy', 'create',
    'state', '[*]', '-->', '--', 'note right', 'note left', 'note top', 'note bottom',
    'clock', 'binary', 'concise', 'robust',
    'network', 'nwdiag',
    'archimate',
    'salt',
    'mindmap',
    'gantt',
    'gitgraph'
  ];

  const contentLower = trimmedContent.toLowerCase();
  return plantUMLKeywords.some(keyword => contentLower.includes(keyword));
};

// Helper function to convert parsed diagram to Mermaid code
const generateMermaidCode = (parsedDiagram: ParsedDiagram): string => {
  if (parsedDiagram.nodes.length === 0) {
    return 'graph TD\n    A[No diagram content]';
  }

  let mermaidCode = 'graph TD\n';
  
  // Add nodes
  parsedDiagram.nodes.forEach(node => {
    const shape = node.type === 'start' ? '((()))' : 
                  node.type === 'end' ? '((()))' :
                  node.type === 'decision' ? '{}' : '[]';
    mermaidCode += `    ${node.id}${shape}[${node.label}]\n`;
  });
  
  // Add connections
  parsedDiagram.connections.forEach(conn => {
    const label = conn.label ? `|${conn.label}|` : '';
    mermaidCode += `    ${conn.from} -->${label} ${conn.to}\n`;
  });
  
  return mermaidCode;
};

// Helper function to render PlantUML diagrams
const renderPlantUMLDiagram = async (content: string): Promise<void> => {
  try {
    const response = await fetch('/api/plantuml/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: content,
        format: 'svg'
      }),
    });

    if (!response.ok) {
      throw new Error(`PlantUML rendering failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    // Display the rendered SVG
    const element = document.getElementById('diagram-container');
    if (element && result.svg) {
      element.innerHTML = result.svg;
    } else if (element && result.url) {
      // If we get a URL instead of SVG, create an img element
      element.innerHTML = `<img src="${result.url}" alt="PlantUML Diagram" style="max-width: 100%; height: auto;" />`;
    } else {
      throw new Error('No rendered diagram received');
    }
  } catch (error) {
    console.error('PlantUML rendering error:', error);
    const element = document.getElementById('diagram-container');
    if (element) {
      element.innerHTML = `<div class="error" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px;">
        <strong>PlantUML Rendering Error:</strong><br/>
        ${error instanceof Error ? error.message : 'Unknown error'}
      </div>`;
    }
    throw error;
  }
};

interface DiagramPreviewProps {
  content: string;
  onContentChange: (content: string) => void;
}

const DiagramPreview: React.FC<DiagramPreviewProps> = ({
  content,
  onContentChange
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const debouncedContent = useDebouncedValue(content || '', 300);

  useEffect(() => {
    const renderDiagram = async () => {
      setIsRendering(true);
      setError(null);

      try {
        // Check if it's a Mermaid diagram
        if (isMermaidDiagram(debouncedContent)) {
          // Render directly as Mermaid
          await DiagramRenderer.render(debouncedContent, 'diagram-container');
        } else if (isPlantUMLDiagram(debouncedContent)) {
          // Render PlantUML diagram
          await renderPlantUMLDiagram(debouncedContent);
        } else {
          // Parse as custom diagram format
          const parseResult = DiagramParser.parse(debouncedContent);
          
          if (parseResult.errors.length > 0) {
            setError(parseResult.errors.join(', '));
            return;
          }

          // Convert to Mermaid code
          const mermaidCode = generateMermaidCode(parseResult);
          await DiagramRenderer.render(mermaidCode, 'diagram-container');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Rendering failed');
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [debouncedContent]);

  return (
    <div className="h-full">
      <ErrorDisplay error={error} />
      {isRendering && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Rendering diagram...</p>
          </div>
        </div>
      )}
      <div
        id="diagram-container"
        className="w-full h-full bg-white border border-gray-200 rounded-lg p-4 overflow-auto"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default DiagramPreview;