// =============================================================================
// LoadingSkeleton — Light skeleton shimmer
// =============================================================================

import React from 'react';

interface SkeletonProps { width?: string; height?: string; className?: string; rounded?: string; }

export function Skeleton({ width = 'w-full', height = 'h-4', className = '', rounded = 'rounded' }: SkeletonProps) {
  return <div className={`skeleton ${width} ${height} ${rounded} ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton width="w-9" height="h-9" rounded="rounded-lg" />
        <Skeleton width="w-16" height="h-5" rounded="rounded-full" />
      </div>
      <div className="space-y-2 pt-1">
        <Skeleton width="w-20" height="h-7" />
        <Skeleton width="w-32" height="h-4" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>{Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3"><Skeleton /></td>
    ))}</tr>
  );
}

export function ChartSkeleton({ height = 'h-60' }: { height?: string }) {
  return (
    <div className={`card p-5 ${height} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <Skeleton width="w-32" height="h-5" />
        <Skeleton width="w-24" height="h-8" rounded="rounded-md" />
      </div>
      <Skeleton width="w-full" className="flex-1" rounded="rounded-md" />
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
  );
}
