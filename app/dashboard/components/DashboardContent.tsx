'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import DiagramGrid from './DiagramGrid';
import { useDiagrams } from '@/hooks/useDiagrams';
import { Button } from '@/components/ui/button';

interface DashboardContentProps {
  userId: string;
}

export default function DashboardContent({ userId }: DashboardContentProps) {
  const { diagrams, loading, error, deleteDiagram } = useDiagrams(userId);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDiagrams = diagrams.filter(diagram =>
    diagram.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diagram.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading diagrams: {error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search diagrams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <Link href="/editor">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Diagram
          </Button>
        </Link>
      </div>

      {/* Diagrams Grid */}
      <DiagramGrid 
        diagrams={filteredDiagrams}
        loading={loading}
        onDelete={deleteDiagram}
      />

      {/* Empty State */}
      {!loading && filteredDiagrams.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No diagrams found' : 'No diagrams yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Create your first sequence diagram to get started'
            }
          </p>
          {!searchTerm && (
            <Link href="/editor">
              <Button>Create Your First Diagram</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}