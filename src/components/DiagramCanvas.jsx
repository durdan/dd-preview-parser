import React, { memo, useCallback, useRef } from 'react';
import DiagramNode from './DiagramNode';
import useDiagramStore from '../stores/diagramStore';

const DiagramCanvas = memo(() => {
  const { 
    nodes, 
    connections, 
    canvasOffset, 
    zoom, 
    selectNode, 
    setCanvasOffset 
  } = useDiagramStore();
  
  const canvasRef = useRef(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current) {
      selectNode(null);
    }
  }, [selectNode]);
  
  const handleMouseDown = useCallback((e) => {
    if (e.target === canvasRef.current) {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging.current) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      
      setCanvasOffset({
        x: canvasOffset.x + deltaX,
        y: canvasOffset.y + deltaY
      });
      
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [canvasOffset, setCanvasOffset]);
  
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);
  
  const canvasStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
    backgroundImage: `
      radial-gradient(circle, #ddd 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
    cursor: isDragging.current ? 'grabbing' : 'grab'
  };
  
  const containerStyle = {
    transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
    transformOrigin: '0 0',
    width: '100%',
    height: '100%',
    position: 'absolute'
  };
  
  return (
    <div
      ref={canvasRef}
      style={canvasStyle}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={containerStyle}>
        {/* Render connections */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {connections.map(connection => {
            const fromNode = nodes.find(n => n.id === connection.from);
            const toNode = nodes.find(n => n.id === connection.to);
            
            if (!fromNode || !toNode) return null;
            
            return (
              <line
                key={connection.id}
                x1={fromNode.x + (fromNode.width || 100) / 2}
                y1={fromNode.y + (fromNode.height || 60) / 2}
                x2={toNode.x + (toNode.width || 100) / 2}
                y2={toNode.y + (toNode.height || 60) / 2}
                stroke="#666"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
            </marker>
          </defs>
        </svg>
        
        {/* Render nodes */}
        {nodes.map(node => (
          <DiagramNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
});

DiagramCanvas.displayName = 'DiagramCanvas';

export default DiagramCanvas;