"use client";

// Shown only while initialLoading is true.
export default function OrderSummarySkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
      <div className="flex gap-2 items-center">
        <div className="flex-1 h-10 bg-gray-200 rounded" />
        <div className="h-10 w-20 bg-gray-200 rounded" />
      </div>
      <div className="border-t pt-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-16" />
            <div className="h-3 bg-gray-200 rounded w-10" />
          </div>
        ))}
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-gray-300 rounded w-20" />
          <div className="h-4 bg-gray-300 rounded w-14" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
      </div>
      <div className="mt-6">
        <div className="h-4 bg-gray-300 rounded w-32 mb-3" />
        <div className="h-16 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
