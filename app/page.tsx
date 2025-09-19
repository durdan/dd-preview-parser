'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the DiagramEditor to avoid SSR issues with Monaco Editor
const DiagramEditor = dynamic(() => import('../src/components/DiagramEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-gray-600">Loading Diagram Editor...</div>
    </div>
  )
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            DD Preview Parser
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto">
            Create, edit, and export beautiful diagrams with real-time preview. 
            Support for Mermaid diagrams, flowcharts, class diagrams, and more.
          </p>
          
          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a 
              href="/editor" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Open Editor
            </a>
            <a 
              href="/dashboard" 
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              My Diagrams
            </a>
            <a 
              href="/auth/login" 
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Sign In
            </a>
          </div>
          
          {/* Feature Cards - Hidden on mobile to prioritize editor */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Preview</h3>
              <p className="text-gray-600">See your diagrams update instantly as you type</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Multiple Formats</h3>
              <p className="text-gray-600">Support for flowcharts, class diagrams, sequence diagrams</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Responsive Design</h3>
              <p className="text-gray-600">Works perfectly on desktop, tablet, and mobile</p>
            </div>
          </div>
          
          {/* Compact feature list for mobile */}
          <div className="md:hidden mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 rounded-full mr-2"></div>
                  Real-time Preview
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded-full mr-2"></div>
                  Multiple Formats
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-100 rounded-full mr-2"></div>
                  Responsive
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Editor Section */}
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading diagram editor...</p>
              </div>
            </div>
          }>
            <DiagramEditor />
          </Suspense>
        </div>
      </div>
    </main>
  );
}