import { useCallback, useRef } from 'react';
import useDiagramStore from '../stores/diagramStore';

export const useDiagramHistory = () => {
  const history = useRef([]);
  const currentIndex = useRef(-1);
  const { nodes, connections, loadDiagram } = useDiagramStore();
  
  const saveState = useCallback(() => {
    const state = { nodes, connections };
    history.current = history.current.slice(0, currentIndex.current + 1);
    history.current.push(state);
    currentIndex.current = history.current.length - 1;
    
    // Limit history size
    if (history.current.length > 50) {
      history.current = history.current.slice(-50);
      currentIndex.current = history.current.length - 1;
    }
  }, [nodes, connections]);
  
  const undo = useCallback(() => {
    if (currentIndex.current > 0) {
      currentIndex.current--;
      loadDiagram(history.current[currentIndex.current]);
    }
  }, [loadDiagram]);
  
  const redo = useCallback(() => {
    if (currentIndex.current < history.current.length - 1) {
      currentIndex.current++;
      loadDiagram(history.current[currentIndex.current]);
    }
  }, [loadDiagram]);
  
  return { saveState, undo, redo };
};