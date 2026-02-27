export function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-6">
      <div className="skeleton-pulse mb-4 h-4 w-1/3 rounded bg-secondary" />
      <div className="skeleton-pulse mb-2 h-8 w-2/3 rounded bg-secondary" />
      <div className="skeleton-pulse h-3 w-1/2 rounded bg-secondary" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="glass rounded-xl p-6">
      <div className="skeleton-pulse mb-4 h-4 w-1/4 rounded bg-secondary" />
      <div className="skeleton-pulse h-48 w-full rounded bg-secondary" />
    </div>
  )
}
