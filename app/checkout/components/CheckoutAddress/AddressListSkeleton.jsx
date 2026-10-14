"use client";

// Shown while loadingadd is true (replaces the whole CheckoutAddress UI).
export default function AddressListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-start animate-pulse"
        >
          <div className="flex items-start gap-3 w-full">
            <div className="mt-1 w-4 h-4 rounded-full bg-gray-300" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
