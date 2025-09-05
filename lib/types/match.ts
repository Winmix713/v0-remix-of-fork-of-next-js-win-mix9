import type React from "react"
export interface Match {
  readonly id: string
  readonly homeTeam: string
  readonly awayTeam: string
  readonly homeScore: number
  readonly awayScore: number
  readonly date: Date
  readonly league: string
  readonly btts: boolean
  readonly comeback: boolean
  readonly metadata?: Record<string, unknown>
}

export interface MatchFilter {
  readonly homeTeam?: string
  readonly awayTeam?: string
  readonly league?: string
  readonly dateRange?: {
    readonly from: Date
    readonly to: Date
  }
  readonly btts?: boolean
  readonly comeback?: boolean
}

export interface Statistics {
  readonly totalMatches: number
  readonly bttsPercentage: number
  readonly comebackPercentage: number
  readonly averageGoals: number
  readonly leagueDistribution: ReadonlyArray<{
    readonly league: string
    readonly count: number
  }>
}

// Utility types
export type AsyncResult<T> = Promise<{
  readonly data?: T
  readonly error?: string
}>

export type ComponentProps<T = {}> = T & {
  readonly className?: string
  readonly children?: React.ReactNode
}
