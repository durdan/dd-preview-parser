import { useState, useEffect, useCallback } from 'react';
import { Diagram, DiagramFilters, DashboardState } from '../types/dashboard';
import { filterAndSortDiagrams } from '../utils/diagramUtils';

const initialFilters: DiagramFilters = {
  search: '',
  visibility: 'all',
  sortBy: 'updatedAt',
  sortOrder: 'desc'
};

export const useDashboard = () => {
  const [state, setState] = useState<DashboardState>({
    diagrams: [],
    filteredDiagrams: [],
    filters: initialFilters,
    loading: true,
    error: null
  });

  const fetchDiagrams = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/diagrams');
      
      if (!response.ok) {
        throw new Error('Failed to fetch diagrams');
      }
      
      const diagrams: Diagram[] = await response.json();
      const filteredDiagrams = filterAndSortDiagrams(diagrams, state.filters);
      
      setState(prev => ({
        ...prev,
        diagrams,
        filteredDiagrams,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }));
    }
  }, [state.filters]);

  const updateFilters = useCallback((newFilters: Partial<DiagramFilters>) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      const filteredDiagrams = filterAndSortDiagrams(prev.diagrams, updatedFilters);
      
      return {
        ...prev,
        filters: updatedFilters,
        filteredDiagrams
      };
    });
  }, []);

  const deleteDiagram = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/diagrams/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete diagram');
      }
      
      setState(prev => {
        const diagrams = prev.diagrams.filter(d => d.id !== id);
        const filteredDiagrams = filterAndSortDiagrams(diagrams, prev.filters);
        
        return {
          ...prev,
          diagrams,
          filteredDiagrams
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete diagram'
      }));
    }
  }, []);

  const toggleVisibility = useCallback(async (id: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/diagrams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update diagram visibility');
      }
      
      setState(prev => {
        const diagrams = prev.diagrams.map(d => 
          d.id === id ? { ...d, isPublic } : d
        );
        const filteredDiagrams = filterAndSortDiagrams(diagrams, prev.filters);
        
        return {
          ...prev,
          diagrams,
          filteredDiagrams
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update visibility'
      }));
    }
  }, []);

  useEffect(() => {
    fetchDiagrams();
  }, []);

  return {
    ...state,
    updateFilters,
    deleteDiagram,
    toggleVisibility,
    refetch: fetchDiagrams
  };
};