import React from 'react';

export default function DiagramCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-20 bg-gray-200 rounded mb-3"></div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-8"></div>
      </div>
    </div>
  );
}


