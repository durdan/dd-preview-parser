import React, { memo } from 'react';
import Draggable from 'react-draggable';
import useDiagramStore from '../stores/diagramStore';

const DiagramNode = memo(({ node }) => {
  const { updateNode, selectNode, selectedNodeId } = useDiagramStore();
  const isSelected = selectedNodeId === node.id;
  
  const handleDrag = (e, data) => {
    updateNode(node.id, { x: data.x, y: data.y });
  };
  
  const handleClick = (e) => {
    e.stopPropagation();
    selectNode(node.id);
  };
  
  const getNodeStyle = () => {
    const baseStyle = {
      width: node.width || 100,
      height: node.height || 60,
      backgroundColor: node.color || '#e3f2fd',
      border: isSelected ? '2px solid #1976d2' : '1px solid #ccc',
      borderRadius: node.type === 'circle' ? '50%' : node.type === 'diamond' ? '0' : '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'move',
      userSelect: 'none',
      fontSize: '12px',
      fontWeight: '500'
    };
    
    if (node.type === 'diamond') {
      baseStyle.transform = 'rotate(45deg)';
      baseStyle.transformOrigin = 'center';
    }
    
    return baseStyle;
  };
  
  return (
    <Draggable
      position={{ x: node.x, y: node.y }}
      onDrag={handleDrag}
      handle=".node-handle"
    >
      <div
        className="node-handle"
        style={getNodeStyle()}
        onClick={handleClick}
      >
        <span style={{ transform: node.type === 'diamond' ? 'rotate(-45deg)' : 'none' }}>
          {node.label || 'Node'}
        </span>
      </div>
    </Draggable>
  );
});

DiagramNode.displayName = 'DiagramNode';

export default DiagramNode;