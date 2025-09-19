'use client';

import { memo } from 'react';
import DiagramCard from './DiagramCard';
import DiagramCardSkeleton from './DiagramCardSkeleton';
import { Diagram } from '@/src/types/diagram';

interface DiagramGridProps {
  diagrams: Diagram[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

const DiagramGrid = memo(function DiagramGrid({ 
  diagrams, 
  loading, 
  onDelete 
}: DiagramGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <DiagramCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {diagrams.map((diagram) => (
        <DiagramCard
          key={diagram.id}
          diagram={diagram}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

export default DiagramGrid;