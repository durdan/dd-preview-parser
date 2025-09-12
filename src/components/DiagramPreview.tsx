import React, { memo } from 'react';
import { ParsedDiagram } from '../types/diagram';

interface DiagramPreviewProps {
  diagram: ParsedDiagram;
  className?: string;
}

const DiagramPreview = memo<DiagramPreviewProps>(({ diagram, className = '' }) => {
  const { nodes, connections, errors } = diagram;

  if (errors.length > 0) {
    return (
      <div className={`diagram-preview error ${className}`}>
        <h3>Syntax Errors:</h3>
        <ul>
          {errors.map((error, index) => (
            <li key={index} className="error-item">{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={`diagram-preview ${className}`}>
      <div className="diagram-content">
        <div className="nodes-section">
          <h3>Nodes ({nodes.length})</h3>
          {nodes.map(node => (
            <div key={node.id} className={`node node-${node.type}`}>
              <strong>{node.id}</strong>: {node.label} ({node.type})
            </div>
          ))}
        </div>
        
        <div className="connections-section">
          <h3>Connections ({connections.length})</h3>
          {connections.map((conn, index) => (
            <div key={index} className="connection">
              {conn.from} → {conn.to}
              {conn.label && <span className="connection-label"> [{conn.label}]</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

DiagramPreview.displayName = 'DiagramPreview';

export default DiagramPreview;