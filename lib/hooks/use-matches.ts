"use client"

import { useCallback, useEffect } from "react"
import { useMatchStore } from "@/lib/stores/match-store"
import { useUIStore } from "@/lib/stores/ui-store"
import { getMatches, getStatistics } from "@/lib/data/matches"
import type { MatchFilter } from "@/lib/types/match"
import { useErrorBoundary } from "react-error-boundary"

export function useMatches(initialData?: {
  matches: any[]
  statistics: any
  totalCount: number
}) {
  const { showBoundary } = useErrorBoundary()
  const { addToast } = useUIStore()

  const {
    matches,
    filteredMatches,
    currentFilter,
    currentPage,
    itemsPerPage,
    sortConfig,
    totalCount,
    isLoading,
    error,
    statistics,
    setMatches,
    setFilter,
    setPage,
    setItemsPerPage,
    setSortConfig,
    setLoading,
    setError,
    setStatistics,
    setTotalCount,
    clearError,
    resetFilters,
  } = useMatchStore()

  // Initialize with server data
  useEffect(() => {
    if (initialData) {
      setMatches(initialData.matches)
      setStatistics(initialData.statistics)
      setTotalCount(initialData.totalCount)
    }
  }, [initialData, setMatches, setStatistics, setTotalCount])

  const loadMatches = useCallback(
    async (filter?: MatchFilter, page = 1) => {
      try {
        setLoading(true)
        setError(null)

        const { data, count, error } = await getMatches(filter, page, itemsPerPage)

        if (error) {
          throw new Error(error)
        }

        setMatches(data)
        setTotalCount(count)

        // Load statistics
        const statsResult = await getStatistics(filter)
        if (statsResult.error) {
          console.warn("Failed to load statistics:", statsResult.error)
        } else {
          setStatistics(statsResult.data)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load matches"
        setError(message)
        addToast({
          type: "error",
          title: "Hiba a mérkőzések betöltése során",
          message,
        })
        showBoundary(new Error(message))
      } finally {
        setLoading(false)
      }
    },
    [itemsPerPage, setLoading, setError, setMatches, setTotalCount, setStatistics, addToast, showBoundary],
  )

  const applyFilters = useCallback(async () => {
    await loadMatches(currentFilter, 1)
    setPage(1)
    addToast({
      type: "info",
      title: "Szűrők alkalmazva",
      message: "Az eredmények frissítve lettek",
    })
  }, [currentFilter, loadMatches, setPage, addToast])

  const handleResetFilters = useCallback(async () => {
    resetFilters()
    await loadMatches({}, 1)
    addToast({
      type: "info",
      title: "Szűrők visszaállítva",
      message: "Minden szűrő törölve lett",
    })
  }, [resetFilters, loadMatches, addToast])

  const handlePageChange = useCallback(
    async (page: number) => {
      setPage(page)
      await loadMatches(currentFilter, page)
    },
    [setPage, loadMatches, currentFilter],
  )

  const handleSort = useCallback(
    (config: { key: string; direction: "asc" | "desc" | "" }) => {
      setSortConfig(config)
    },
    [setSortConfig],
  )

  const exportToCSV = useCallback(() => {
    try {
      if (filteredMatches.length === 0) {
        addToast({
          type: "error",
          title: "Nincs exportálható adat",
          message: "Alkalmazz szűrőket vagy töltsd be az adatokat",
        })
        return
      }

      const headers = [
        "Hazai csapat",
        "Vendég csapat",
        "Hazai gólok",
        "Vendég gólok",
        "BTTS",
        "Fordítás",
        "Dátum",
        "Liga",
      ]

      const csvRows = filteredMatches.map((match) => {
        const escapeCSV = (value: string | number | boolean | undefined) => {
          if (value === undefined || value === null) return '""'
          const escaped = value.toString().replace(/"/g, '""')
          return `"${escaped}"`
        }

        return [
          escapeCSV(match.homeTeam),
          escapeCSV(match.awayTeam),
          escapeCSV(match.homeScore),
          escapeCSV(match.awayScore),
          escapeCSV(match.btts ? "Igen" : "Nem"),
          escapeCSV(match.comeback ? "Igen" : "Nem"),
          escapeCSV(match.date.toISOString().split("T")[0]),
          escapeCSV(match.league),
        ].join(",")
      })

      const csvContent = [headers.map((h) => `"${h}"`).join(","), ...csvRows].join("\n")

      const BOM = "\uFEFF"
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })

      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)

      const dateStr = new Date().toISOString().split("T")[0]
      let filename = `winmix-matches-${dateStr}`

      if (currentFilter.homeTeam || currentFilter.awayTeam) {
        const teams = [currentFilter.homeTeam, currentFilter.awayTeam].filter(Boolean).join("-vs-")
        filename += `-${teams.replace(/[^a-zA-Z0-9-]/g, "")}`
      }

      link.setAttribute("download", `${filename}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      addToast({
        type: "success",
        title: "CSV export sikeres",
        message: `${filteredMatches.length} mérkőzés exportálva`,
      })
    } catch (error) {
      console.error("CSV export error:", error)
      addToast({
        type: "error",
        title: "Export hiba",
        message: "Hiba történt a CSV fájl létrehozása során",
      })
    }
  }, [filteredMatches, currentFilter, addToast])

  return {
    // State
    matches: filteredMatches,
    allMatches: matches,
    currentFilter,
    currentPage,
    itemsPerPage,
    sortConfig,
    totalCount,
    isLoading,
    error,
    statistics,

    // Actions
    setFilter,
    setItemsPerPage,
    applyFilters,
    resetFilters: handleResetFilters,
    handlePageChange,
    handleSort,
    exportToCSV,
    clearError,
    loadMatches,
  }
}

// Error Boundary Hook
export function useErrorHandler() {
  const { showBoundary } = useErrorBoundary()
  const { addToast } = useUIStore()

  return useCallback(
    (error: unknown, context?: string) => {
      const message = error instanceof Error ? error.message : "An unexpected error occurred"
      const enhancedError = new Error(context ? `${context}: ${message}` : message)

      // Log to monitoring service
      console.error("[WinMix] Error:", enhancedError, { context, originalError: error })

      // Show toast notification
      addToast({
        type: "error",
        title: context || "Hiba történt",
        message,
      })

      showBoundary(enhancedError)
    },
    [showBoundary, addToast],
  )
}
