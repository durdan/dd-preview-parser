export interface Diagram {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  nodeCount: number;
  edgeCount: number;
}

export interface DiagramFilters {
  search: string;
  visibility: 'all' | 'public' | 'private';
  sortBy: 'title' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

export interface DashboardState {
  diagrams: Diagram[];
  filteredDiagrams: Diagram[];
  filters: DiagramFilters;
  loading: boolean;
  error: string | null;
}