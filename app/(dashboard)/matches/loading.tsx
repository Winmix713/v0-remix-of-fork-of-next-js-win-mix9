import { MatchListSkeleton } from "@/components/ui/skeletons"

export default function MatchesLoading() {
  return (
    <section className="bg-black/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="text-center space-y-3 mb-8">
          <div className="h-16 bg-muted rounded animate-pulse mx-auto max-w-2xl" />
          <div className="h-6 bg-muted rounded animate-pulse mx-auto max-w-lg" />
        </div>

        <div className="space-y-6">
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <MatchListSkeleton />
        </div>
      </div>
    </section>
  )
}
