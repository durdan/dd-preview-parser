export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md animate-pulse" />
        <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <DiagramCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function DiagramCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="aspect-video bg-gray-200 rounded-t-lg animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
}