function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('skeleton rounded-md', className)}
      {...props}
    />
  );
}

Skeleton.Text = function SkeletonText({ lines = 1, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3 rounded',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

Skeleton.Circle = function SkeletonCircle({ size = 40, className }) {
  return (
    <Skeleton
      className={cn('rounded-full shrink-0', className)}
      style={{ width: size, height: size }}
    />
  );
};

Skeleton.Rectangle = function SkeletonRectangle({ className }) {
  return <Skeleton className={cn('w-full rounded-xl', className)} />;
};

// ── Dashboard skeleton: stat cards + module cards ──────────────
Skeleton.Dashboard = function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome card */}
      <div className="card bg-gradient-to-r from-blue-600 to-blue-500 border-0">
        <div className="flex items-center gap-4">
          <Skeleton.Circle size={64} className="bg-white/20" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40 bg-white/30" />
            <Skeleton className="h-3 w-56 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card">
            <div className="flex items-center gap-4">
              <Skeleton.Rectangle className="w-12 h-12 shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="card">
            <Skeleton.Rectangle className="w-12 h-12 mb-3" />
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Table skeleton: matches table layout ──────────────────────
Skeleton.Table = function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div className="card">
      <div className="space-y-4">
        {/* Search bar */}
        <Skeleton className="h-10 w-full rounded-lg" />

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex bg-gray-50 dark:bg-gray-700 px-4 py-3 gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-3 flex-1" />
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className={cn(
                'flex px-4 py-3 gap-4',
                rowIdx < rows - 1 && 'border-t border-gray-100 dark:border-gray-700'
              )}
            >
              {Array.from({ length: columns }).map((_, colIdx) => (
                <Skeleton
                  key={colIdx}
                  className={cn(
                    'h-4',
                    colIdx === columns - 1 ? 'w-16' : 'flex-1'
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
