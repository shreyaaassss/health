import React from 'react';
export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-xl animate-pulse ${className}`} style={{ background: '#EEF1F6', ...style }} />;
}

export function RecordsPageSkeleton() {
  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-16 rounded-xl" />
      </div>

      {/* Privacy banner */}
      <Skeleton className="h-16 w-full rounded-2xl mb-5" />

      {/* Category tabs */}
      <div className="flex gap-2 mb-4">
        {[60, 44, 88, 72, 96, 80].map((w, i) => (
          <Skeleton key={i} className={`h-8 rounded-full flex-shrink-0`} style={{ width: w }} />
        ))}
      </div>

      {/* Record cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl px-4 py-4 flex items-center gap-4" style={{ background: '#FFFFFF', border: '1px solid #EEF1F6' }}>
            <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SharePageSkeleton() {
  return (
    <div className="px-4 pt-6 pb-4">
      <Skeleton className="h-2 w-full rounded-full mb-1" />
      <Skeleton className="h-2 w-1/2 rounded-full mb-6" />
      <Skeleton className="h-6 w-40 mb-1" />
      <Skeleton className="h-4 w-56 mb-5" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full rounded-2xl mb-3" />
      ))}
    </div>
  );
}

export function AccessPageSkeleton() {
  return (
    <div className="px-4 pt-6 pb-4">
      <Skeleton className="h-7 w-40 mb-1" />
      <Skeleton className="h-4 w-56 mb-6" />
      <Skeleton className="h-16 w-full rounded-2xl mb-5" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

export function HistoryPageSkeleton() {
  return (
    <div className="px-4 pt-6 pb-4">
      <Skeleton className="h-7 w-40 mb-1" />
      <Skeleton className="h-4 w-48 mb-5" />
      <div className="flex gap-2 mb-5">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl mb-3" />
      ))}
    </div>
  );
}
