import { useState, useEffect } from 'react';
import { diagramService } from '../lib/diagramService';

interface Diagram {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  isPublic: boolean;
  ownerId: string;
  thumbnail?: string;
  participantCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface UseDiagramsReturn {
  diagrams: Diagram[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createDiagram: (data: { title: string; description?: string; content: string; type?: string }) => Promise<void>;
  updateDiagram: (id: string, data: { title?: string; description?: string; content?: string; type?: string }) => Promise<void>;
  deleteDiagram: (id: string) => Promise<void>;
}

export function useDiagrams(): UseDiagramsReturn {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagrams = async () => {
    try {
      setLoading(true);
      setError(null);
      const userDiagrams = await diagramService.getUserDiagrams();
      setDiagrams(userDiagrams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch diagrams');
    } finally {
      setLoading(false);
    }
  };

  const createDiagram = async (data: { title: string; description?: string; content: string; type?: string }) => {
    try {
      await diagramService.saveDiagram({
        title: data.title,
        description: data.description || '',
        content: data.content,
        type: data.type || 'mermaid'
      });
      await fetchDiagrams(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create diagram');
      throw err;
    }
  };

  const updateDiagram = async (id: string, data: { title?: string; description?: string; content?: string; type?: string }) => {
    try {
      await diagramService.saveDiagram({
        id,
        title: data.title || '',
        description: data.description || '',
        content: data.content || '',
        type: data.type
      });
      await fetchDiagrams(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update diagram');
      throw err;
    }
  };

  const deleteDiagram = async (id: string) => {
    try {
      await diagramService.deleteDiagram(id);
      await fetchDiagrams(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete diagram');
      throw err;
    }
  };

  useEffect(() => {
    fetchDiagrams();
  }, []);

  return {
    diagrams,
    loading,
    error,
    refetch: fetchDiagrams,
    createDiagram,
    updateDiagram,
    deleteDiagram,
  };
}
