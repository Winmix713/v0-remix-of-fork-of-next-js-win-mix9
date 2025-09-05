export function MatchListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 bg-white/5">
        <div className="p-4 border-b border-white/10">
          <div className="h-6 bg-muted rounded animate-pulse w-48" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 bg-muted rounded animate-pulse flex-1" />
              <div className="h-4 bg-muted rounded animate-pulse w-20" />
              <div className="h-4 bg-muted rounded animate-pulse w-16" />
              <div className="h-4 bg-muted rounded animate-pulse w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-20" />
            <div className="h-8 bg-muted rounded animate-pulse w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FilterSkeleton() {
  return (
    <div className="ring-1 ring-white/10 bg-white/5 rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-24" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
