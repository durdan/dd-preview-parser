import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { storage } from '@/lib/storage';
import dynamic from 'next/dynamic';

// Dynamically import DiagramEditor to avoid SSR issues
const DiagramEditor = dynamic(() => import('@/src/components/DiagramEditor'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading diagram editor...</p>
      </div>
    </div>
  ),
});

interface EditorPageProps {
  params: {
    id: string;
  };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  // Find the diagram
  const diagram = storage.findDiagramById(params.id);
  
  if (!diagram) {
    redirect('/dashboard');
  }

  // Check if user owns this diagram
  if (diagram.ownerId !== session.user.id) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Diagram</h1>
          <p className="mt-2 text-gray-600">
            {diagram.title}
          </p>
        </div>
        
        <Suspense fallback={
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        }>
          <DiagramEditor 
            initialDiagram={diagram}
          />
        </Suspense>
      </div>
    </div>
  );
}


