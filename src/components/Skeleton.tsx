interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className || ''}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-20 h-6 rounded-lg" />
      </div>
      <Skeleton className="w-1/2 h-6 mb-4" />
      <Skeleton className="w-3/4 h-4 mb-2" />
      <Skeleton className="w-2/3 h-4" />
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1">
            <Skeleton className="w-1/3 h-5 mb-2" />
            <Skeleton className="w-1/2 h-4" />
          </div>
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}
