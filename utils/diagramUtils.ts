import { Diagram, DiagramFilters } from '../types/dashboard';

export const filterAndSortDiagrams = (
  diagrams: Diagram[],
  filters: DiagramFilters
): Diagram[] => {
  let filtered = diagrams;

  // Apply search filter
  if (filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(diagram =>
      diagram.title.toLowerCase().includes(searchTerm) ||
      diagram.description?.toLowerCase().includes(searchTerm)
    );
  }

  // Apply visibility filter
  if (filters.visibility !== 'all') {
    filtered = filtered.filter(diagram =>
      filters.visibility === 'public' ? diagram.isPublic : !diagram.isPublic
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (filters.sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  
  return formatDate(dateString);
};