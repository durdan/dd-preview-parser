import { useState } from 'react';
import { diagramService } from '../services/diagramService';
import { DiagramData, ValidationError } from '../types/diagram';

export function useDiagram() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const loadDiagram = async (id: string): Promise<DiagramData> => {
    setLoading(true);
    setError(null);
    
    try {
      const diagram = await diagramService.getDiagram(id);
      return diagram;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load diagram';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveDiagram = async (diagram: DiagramData): Promise<DiagramData> => {
    setLoading(true);
    setError(null);
    
    try {
      const savedDiagram = diagram.id 
        ? await diagramService.updateDiagram(diagram.id, diagram)
        : await diagramService.createDiagram(diagram);
      
      return savedDiagram;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save diagram';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateDiagram = async (diagram: DiagramData): Promise<ValidationError[]> => {
    try {
      return await diagramService.validateDiagram(diagram);
    } catch (err) {
      console.warn('Validation request failed:', err);
      return [];
    }
  };

  return {
    loading,
    error,
    loadDiagram,
    saveDiagram,
    validateDiagram,
    clearError
  };
}