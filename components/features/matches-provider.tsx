"use client"

import type React from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useMatches } from "@/lib/hooks/use-matches"
import type { Match, MatchFilter, Statistics } from "@/lib/types/match"

interface MatchesProviderProps {
  children: React.ReactNode
  initialData: {
    matches: Match[]
    teams: string[]
    statistics: Statistics
    totalCount: number
  }
  initialFilter?: MatchFilter
  initialPage?: number
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 text-destructive mx-auto">⚠️</div>
        <h2 className="text-2xl font-semibold text-white">Hiba történt</h2>
        <p className="text-muted-foreground max-w-md text-pretty">
          {error.message || "Nem várt hiba történt az alkalmazásban."}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Újrapróbálás
        </button>
      </div>
    </div>
  )
}

export function MatchesProvider({ children, initialData, initialFilter, initialPage }: MatchesProviderProps) {
  // Initialize the matches hook with server data
  useMatches(initialData)

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      {children}
    </ErrorBoundary>
  )
}
