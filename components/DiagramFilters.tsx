import React from 'react';
import { DiagramFilters as FilterType } from '../types/dashboard';

interface DiagramFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  diagramCount: number;
}

export const DiagramFilters: React.FC<DiagramFiltersProps> = ({
  filters,
  onFiltersChange,
  diagramCount
}) => {
  return (
    <div className="dashboard-filters">
      <div className="filters-row">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search diagrams..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filters.visibility}
            onChange={(e) => onFiltersChange({ 
              visibility: e.target.value as FilterType['visibility'] 
            })}
            className="filter-select"
          >
            <option value="all">All Diagrams</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>
          
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              onFiltersChange({ 
                sortBy: sortBy as FilterType['sortBy'],
                sortOrder: sortOrder as FilterType['sortOrder']
              });
            }}
            className="filter-select"
          >
            <option value="updatedAt-desc">Recently Updated</option>
            <option value="updatedAt-asc">Oldest Updated</option>
            <option value="createdAt-desc">Recently Created</option>
            <option value="createdAt-asc">Oldest Created</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </div>
      </div>
      
      <div className="results-count">
        {diagramCount} diagram{diagramCount !== 1 ? 's' : ''} found
      </div>
    </div>
  );
};