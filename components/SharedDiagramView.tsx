'use client';

import { useEffect, useState } from 'react';
import { DiagramRenderer } from '@/src/services/DiagramRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { SharedDiagram } from '@/types/sharing';
import Link from 'next/link';

interface SharedDiagramViewProps {
  diagramId: string;
}

export function SharedDiagramView({ diagramId }: SharedDiagramViewProps) {
  const [diagram, setDiagram] = useState<SharedDiagram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        const response = await fetch(`/api/diagrams/${diagramId}/public`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Diagram not found or not publicly shared');
          } else {
            setError('Failed to load diagram');
          }
          return;
        }

        const data = await response.json();
        setDiagram(data);
      } catch (error) {
        setError('Failed to load diagram');
        console.error('Error fetching shared diagram:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagram();
  }, [diagramId]);

  useEffect(() => {
    if (diagram) {
      DiagramRenderer.render(diagram.content, 'diagram-container').catch(console.error);
    }
  }, [diagram]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading diagram...</p>
        </div>
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Diagram not found'}
          </h1>
          <p className="text-gray-600 mb-4">
            This diagram may be private or no longer exist.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">{diagram.title}</h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {diagram.author.name}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(diagram.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div id="diagram-container" className="w-full h-full p-4" style={{ minHeight: '400px' }} />
        </div>
      </main>
    </div>
  );
}