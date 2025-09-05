import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { persist } from "zustand/middleware"
import type { Match, MatchFilter, Statistics } from "@/lib/types/match"

interface MatchState {
  // State
  matches: Match[]
  filteredMatches: Match[]
  currentFilter: MatchFilter
  statistics: Statistics | null
  isLoading: boolean
  error: string | null
  currentPage: number
  itemsPerPage: number
  totalCount: number
  sortConfig: {
    key: string
    direction: "asc" | "desc" | ""
  }

  // Actions
  setMatches: (matches: Match[]) => void
  setFilter: (filter: MatchFilter) => void
  setPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  setSortConfig: (config: { key: string; direction: "asc" | "desc" | "" }) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setStatistics: (stats: Statistics) => void
  setTotalCount: (count: number) => void
  addMatch: (match: Match) => void
  updateMatch: (id: string, updates: Partial<Match>) => void
  deleteMatch: (id: string) => void
  clearError: () => void
  resetFilters: () => void

  // Computed
  getMatchById: (id: string) => Match | undefined
  getFilteredMatches: () => Match[]
}

const initialFilter: MatchFilter = {
  homeTeam: "",
  awayTeam: "",
  btts: undefined,
  comeback: undefined,
}

export const useMatchStore = create<MatchState>()(
  subscribeWithSelector(
    immer(
      persist(
        (set, get) => ({
          // Initial state
          matches: [],
          filteredMatches: [],
          currentFilter: initialFilter,
          statistics: null,
          isLoading: false,
          error: null,
          currentPage: 1,
          itemsPerPage: 50,
          totalCount: 0,
          sortConfig: { key: "", direction: "" },

          // Actions
          setMatches: (matches) =>
            set((state) => {
              state.matches = matches
              state.filteredMatches = applyFilter(matches, state.currentFilter, state.sortConfig)
            }),

          setFilter: (filter) =>
            set((state) => {
              state.currentFilter = filter
              state.filteredMatches = applyFilter(state.matches, filter, state.sortConfig)
              state.currentPage = 1 // Reset to first page when filtering
            }),

          setPage: (page) =>
            set((state) => {
              state.currentPage = page
            }),

          setItemsPerPage: (items) =>
            set((state) => {
              state.itemsPerPage = items
              state.currentPage = 1 // Reset to first page when changing items per page
            }),

          setSortConfig: (config) =>
            set((state) => {
              state.sortConfig = config
              state.filteredMatches = applyFilter(state.matches, state.currentFilter, config)
            }),

          setLoading: (loading) =>
            set((state) => {
              state.isLoading = loading
            }),

          setError: (error) =>
            set((state) => {
              state.error = error
            }),

          setStatistics: (stats) =>
            set((state) => {
              state.statistics = stats
            }),

          setTotalCount: (count) =>
            set((state) => {
              state.totalCount = count
            }),

          addMatch: (match) =>
            set((state) => {
              state.matches.push(match)
              state.filteredMatches = applyFilter(state.matches, state.currentFilter, state.sortConfig)
            }),

          updateMatch: (id, updates) =>
            set((state) => {
              const index = state.matches.findIndex((m) => m.id === id)
              if (index !== -1) {
                Object.assign(state.matches[index], updates)
                state.filteredMatches = applyFilter(state.matches, state.currentFilter, state.sortConfig)
              }
            }),

          deleteMatch: (id) =>
            set((state) => {
              state.matches = state.matches.filter((m) => m.id !== id)
              state.filteredMatches = applyFilter(state.matches, state.currentFilter, state.sortConfig)
            }),

          clearError: () =>
            set((state) => {
              state.error = null
            }),

          resetFilters: () =>
            set((state) => {
              state.currentFilter = initialFilter
              state.sortConfig = { key: "", direction: "" }
              state.currentPage = 1
              state.filteredMatches = applyFilter(state.matches, initialFilter, { key: "", direction: "" })
            }),

          // Computed getters
          getMatchById: (id) => get().matches.find((m) => m.id === id),
          getFilteredMatches: () => get().filteredMatches,
        }),
        {
          name: "winmix-match-store",
          partialize: (state) => ({
            currentFilter: state.currentFilter,
            itemsPerPage: state.itemsPerPage,
            sortConfig: state.sortConfig,
          }),
        },
      ),
    ),
  ),
)

// Helper functions
function applyFilter(
  matches: Match[],
  filter: MatchFilter,
  sortConfig: { key: string; direction: "asc" | "desc" | "" },
): Match[] {
  let filtered = [...matches]

  // Apply filters
  if (filter.homeTeam) {
    filtered = filtered.filter((match) => match.homeTeam.toLowerCase().includes(filter.homeTeam!.toLowerCase()))
  }
  if (filter.awayTeam) {
    filtered = filtered.filter((match) => match.awayTeam.toLowerCase().includes(filter.awayTeam!.toLowerCase()))
  }
  if (filter.league) {
    filtered = filtered.filter((match) => match.league === filter.league)
  }
  if (filter.btts !== undefined) {
    filtered = filtered.filter((match) => match.btts === filter.btts)
  }
  if (filter.comeback !== undefined) {
    filtered = filtered.filter((match) => match.comeback === filter.comeback)
  }
  if (filter.dateRange) {
    filtered = filtered.filter((match) => {
      const matchDate = new Date(match.date)
      return matchDate >= filter.dateRange!.from && matchDate <= filter.dateRange!.to
    })
  }

  // Apply sorting
  if (sortConfig.key && sortConfig.direction) {
    filtered = sortMatches(filtered, sortConfig)
  }

  return filtered
}

function sortMatches(matches: Match[], config: { key: string; direction: "asc" | "desc" | "" }): Match[] {
  if (!config.key || !config.direction) return matches

  return [...matches].sort((a, b) => {
    let result = 0

    switch (config.key) {
      case "homeTeam":
      case "awayTeam":
      case "league":
        result = a[config.key as keyof Match].toString().localeCompare(b[config.key as keyof Match].toString(), "hu")
        break

      case "homeScore":
      case "awayScore":
        result = (a[config.key as keyof Match] as number) - (b[config.key as keyof Match] as number)
        break

      case "date":
        result = new Date(a.date).getTime() - new Date(b.date).getTime()
        break

      case "btts":
      case "comeback":
        result = (a[config.key] === true ? 1 : 0) - (b[config.key] === true ? 1 : 0)
        break

      default:
        // Handle metadata fields
        if (a.metadata && b.metadata && config.key in a.metadata) {
          const aValue = a.metadata[config.key]
          const bValue = b.metadata[config.key]
          if (typeof aValue === "string" && typeof bValue === "string") {
            result = aValue.localeCompare(bValue, "hu")
          }
        }
        break
    }

    return config.direction === "asc" ? result : -result
  })
}

// Store subscriptions for side effects
useMatchStore.subscribe(
  (state) => state.error,
  (error) => {
    if (error) {
      console.error("[WinMix] Store error:", error)
    }
  },
)
