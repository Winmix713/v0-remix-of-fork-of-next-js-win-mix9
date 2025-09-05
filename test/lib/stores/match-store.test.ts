import { describe, it, expect, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useMatchStore } from "@/lib/stores/match-store"
import type { Match } from "@/lib/types/match"

const mockMatches: Match[] = [
  {
    id: "1",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    homeScore: 2,
    awayScore: 1,
    date: new Date("2024-01-15"),
    league: "Premier League",
    btts: true,
    comeback: false,
  },
  {
    id: "2",
    homeTeam: "Liverpool",
    awayTeam: "Manchester City",
    homeScore: 1,
    awayScore: 2,
    date: new Date("2024-01-16"),
    league: "Premier League",
    btts: true,
    comeback: true,
  },
]

describe("MatchStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useMatchStore.getState().setMatches([])
    useMatchStore.getState().resetFilters()
  })

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useMatchStore())

    expect(result.current.matches).toEqual([])
    expect(result.current.filteredMatches).toEqual([])
    expect(result.current.currentFilter).toEqual({
      homeTeam: "",
      awayTeam: "",
      btts: undefined,
      comeback: undefined,
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it("should set matches and update filtered matches", () => {
    const { result } = renderHook(() => useMatchStore())

    act(() => {
      result.current.setMatches(mockMatches)
    })

    expect(result.current.matches).toEqual(mockMatches)
    expect(result.current.filteredMatches).toEqual(mockMatches)
  })

  it("should filter matches by home team", () => {
    const { result } = renderHook(() => useMatchStore())

    act(() => {
      result.current.setMatches(mockMatches)
    })

    act(() => {
      result.current.setFilter({ homeTeam: "Arsenal" })
    })

    expect(result.current.filteredMatches).toHaveLength(1)
    expect(result.current.filteredMatches[0].homeTeam).toBe("Arsenal")
  })

  it("should filter matches by BTTS", () => {
    const { result } = renderHook(() => useMatchStore())

    act(() => {
      result.current.setMatches(mockMatches)
    })

    act(() => {
      result.current.setFilter({ btts: true })
    })

    expect(result.current.filteredMatches).toHaveLength(2)
    expect(result.current.filteredMatches.every((m) => m.btts)).toBe(true)
  })

  it("should sort matches correctly", () => {
    const { result } = renderHook(() => useMatchStore())

    act(() => {
      result.current.setMatches(mockMatches)
    })

    act(() => {
      result.current.setSortConfig({ key: "homeTeam", direction: "asc" })
    })

    expect(result.current.filteredMatches[0].homeTeam).toBe("Arsenal")
    expect(result.current.filteredMatches[1].homeTeam).toBe("Liverpool")
  })

  it("should add new match", () => {
    const { result } = renderHook(() => useMatchStore())
    const newMatch: Match = {
      id: "3",
      homeTeam: "Tottenham",
      awayTeam: "West Ham",
      homeScore: 3,
      awayScore: 0,
      date: new Date("2024-01-17"),
      league: "Premier League",
      btts: false,
      comeback: false,
    }

    act(() => {
      result.current.setMatches(mockMatches)
    })

    act(() => {
      result.current.addMatch(newMatch)
    })

    expect(result.current.matches).toHaveLength(3)
    expect(result.current.matches).toContain(newMatch)
  })

  it("should reset filters", () => {
    const { result } = renderHook(() => useMatchStore())

    act(() => {
      result.current.setMatches(mockMatches)
      result.current.setFilter({ homeTeam: "Arsenal", btts: true })
      result.current.setSortConfig({ key: "homeTeam", direction: "asc" })
    })

    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.currentFilter).toEqual({
      homeTeam: "",
      awayTeam: "",
      btts: undefined,
      comeback: undefined,
    })
    expect(result.current.sortConfig).toEqual({ key: "", direction: "" })
    expect(result.current.currentPage).toBe(1)
  })
})
