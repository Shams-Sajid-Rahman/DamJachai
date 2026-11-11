import { cn } from '../../lib/cn.js';

export function Skeleton({ className }) {
  return <span aria-hidden="true" className={cn('block animate-pulse rounded-md bg-slate-200/80', className)} />;
}

export function SkeletonCard({ lines = 3, className }) {
  return (
    <div className={cn('space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-card', className)}>
      <Skeleton className="h-5 w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i % 2 ? 'w-1/2' : 'w-5/6')} />
      ))}
    </div>
  );
}
