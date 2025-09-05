import { Suspense } from "react"
import { MatchesProvider } from "@/components/features/matches-provider"
import { MatchesPage } from "@/components/features/matches-page"
import { MatchListSkeleton } from "@/components/ui/skeletons"
import { getMatches, getTeams, getStatistics } from "@/lib/data/matches"
import type { MatchFilter } from "@/lib/types/match"

interface MatchesPageProps {
  searchParams: {
    homeTeam?: string
    awayTeam?: string
    league?: string
    btts?: string
    comeback?: string
    page?: string
  }
}

export default async function MatchesPageServer({ searchParams }: MatchesPageProps) {
  const filter: MatchFilter = {
    homeTeam: searchParams.homeTeam,
    awayTeam: searchParams.awayTeam,
    league: searchParams.league,
    btts: searchParams.btts === "true" ? true : searchParams.btts === "false" ? false : undefined,
    comeback: searchParams.comeback === "true" ? true : searchParams.comeback === "false" ? false : undefined,
  }

  const page = Number.parseInt(searchParams.page ?? "1", 10)

  return (
    <section className="bg-black/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white text-balance">
            Mérkőzés szűrő és statisztikák
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-300 text-pretty">
            Szűrd a meccseket csapatokra és eseményekre, elemezd a kimeneteleket, és exportáld CSV-be.
          </p>
        </div>

        <Suspense fallback={<MatchListSkeleton />}>
          <MatchesServerData filter={filter} page={page} />
        </Suspense>
      </div>
    </section>
  )
}

// Server component for data fetching
async function MatchesServerData({
  filter,
  page,
}: {
  filter: MatchFilter
  page: number
}) {
  const [matchesResult, teamsResult, statsResult] = await Promise.all([
    getMatches(filter, page),
    getTeams(),
    getStatistics(filter),
  ])

  if (matchesResult.error || teamsResult.error || statsResult.error) {
    throw new Error(`Failed to load data: ${matchesResult.error || teamsResult.error || statsResult.error}`)
  }

  return (
    <MatchesProvider
      initialData={{
        matches: matchesResult.data,
        teams: teamsResult.data,
        statistics: statsResult.data,
        totalCount: matchesResult.count,
      }}
      initialFilter={filter}
      initialPage={page}
    >
      <MatchesPage />
    </MatchesProvider>
  )
}

// Metadata for SEO
export async function generateMetadata({ searchParams }: MatchesPageProps) {
  const filter = searchParams.homeTeam || searchParams.awayTeam || searchParams.league

  return {
    title: filter ? `Mérkőzések - ${filter} | WinMix` : "Mérkőzések | WinMix",
    description: "Böngésszen és elemezzen mérkőzéseket részletes szűrési lehetőségekkel",
    openGraph: {
      title: "WinMix - Mérkőzés Elemzés",
      description: "Professzionális mérkőzés statisztikák és elemzések",
      type: "website",
    },
  }
}
