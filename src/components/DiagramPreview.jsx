import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import mermaid from 'mermaid';

// PlantUML encoder for generating URLs
const plantumlEncoder = {
  encode: (plantuml) => {
    // Simple base64 encoding for PlantUML
    const compressed = btoa(unescape(encodeURIComponent(plantuml)));
    return compressed;
  }
};

const DiagramPreview = ({ 
  diagramCode, 
  diagramType = 'mermaid', 
  className = '',
  onError,
  debounceMs = 500 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [renderKey, setRenderKey] = useState(0);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Memoize diagram code to prevent unnecessary re-renders
  const memoizedDiagramCode = useMemo(() => diagramCode?.trim(), [diagramCode]);

  // Initialize Mermaid once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'monospace'
    });
  }, []);

  const renderMermaid = useCallback(async (code, container) => {
    try {
      // Clear previous content
      container.innerHTML = '';
      
      // Generate unique ID for this render
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Validate and render
      await mermaid.parse(code);
      const { svg } = await mermaid.render(id, code);
      
      container.innerHTML = svg;
      return true;
    } catch (err) {
      throw new Error(`Mermaid rendering failed: ${err.message}`);
    }
  }, []);

  const renderPlantUML = useCallback(async (code, container, signal) => {
    try {
      // Clear previous content
      container.innerHTML = '';
      
      // Create loading placeholder
      container.innerHTML = '<div class="plantuml-loading">Rendering PlantUML...</div>';
      
      // Encode PlantUML code
      const encoded = plantumlEncoder.encode(code);
      
      // Use public PlantUML server (in production, consider self-hosted)
      const imageUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;
      
      // Create image element
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        // Handle abort signal
        if (signal?.aborted) {
          reject(new Error('Rendering cancelled'));
          return;
        }

        img.onload = () => {
          if (signal?.aborted) {
            reject(new Error('Rendering cancelled'));
            return;
          }
          
          container.innerHTML = '';
          container.appendChild(img);
          resolve(true);
        };

        img.onerror = () => {
          reject(new Error('Failed to load PlantUML diagram'));
        };

        // Set up abort handling
        signal?.addEventListener('abort', () => {
          img.src = '';
          reject(new Error('Rendering cancelled'));
        });

        img.src = imageUrl;
        img.alt = 'PlantUML Diagram';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      });
    } catch (err) {
      throw new Error(`PlantUML rendering failed: ${err.message}`);
    }
  }, []);

  const renderDiagram = useCallback(async () => {
    if (!memoizedDiagramCode || !containerRef.current) {
      return;
    }

    // Cancel previous render
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);

    try {
      const container = containerRef.current;
      
      if (diagramType === 'mermaid') {
        await renderMermaid(memoizedDiagramCode, container);
      } else if (diagramType === 'plantuml') {
        await renderPlantUML(memoizedDiagramCode, container, signal);
      } else {
        throw new Error(`Unsupported diagram type: ${diagramType}`);
      }

      // Force re-render key update for React
      setRenderKey(prev => prev + 1);
    } catch (err) {
      if (err.message !== 'Rendering cancelled') {
        const errorMessage = err.message || 'Unknown rendering error';
        setError(errorMessage);
        onError?.(errorMessage);
        
        // Show error in container
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="diagram-error">
              <strong>Rendering Error:</strong><br/>
              ${errorMessage}
            </div>
          `;
        }
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [memoizedDiagramCode, diagramType, renderMermaid, renderPlantUML, onError]);

  // Debounced rendering effect
  useEffect(() => {
    if (!memoizedDiagramCode) {
      if (containerRef.current) {
        containerRef.current.innerHTML = '<div class="diagram-placeholder">No diagram code provided</div>';
      }
      setIsLoading(false);
      setError(null);
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced rendering
    timeoutRef.current = setTimeout(() => {
      renderDiagram();
    }, debounceMs);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [memoizedDiagramCode, diagramType, renderDiagram, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={`diagram-preview ${className}`}>
      {isLoading && (
        <div className="diagram-loading">
          <div className="loading-spinner"></div>
          <span>Rendering {diagramType} diagram...</span>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className={`diagram-container ${isLoading ? 'loading' : ''} ${error ? 'error' : ''}`}
        key={renderKey}
      />
      
      {error && (
        <div className="diagram-error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default DiagramPreview;