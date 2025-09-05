"use client"

import { useEffect, useState } from "react"
import { TeamLogo } from "./team-logo"
import { PaginationControls } from "./pagination-controls"

interface Match {
  id: number
  home: string
  away: string
  ht: string
  ft: string
  btts: string
  comeback: string
  result: string
  date?: string
  match_time: string
  league: string
  season: string
}

interface SortConfig {
  key: string
  direction: "asc" | "desc" | ""
}

interface ResultsSectionProps {
  matches: Match[]
  currentPage: number
  itemsPerPage: number
  sortConfig: SortConfig
  totalCount: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  onSort: (config: SortConfig) => void
}

export function ResultsSection({
  matches,
  currentPage,
  itemsPerPage,
  sortConfig,
  totalCount,
  onPageChange,
  onItemsPerPageChange,
  onSort,
}: ResultsSectionProps) {
  const [selectedMatches, setSelectedMatches] = useState<Set<number>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons()
    }
  }, [matches])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount)
  const displayedMatches = matches.slice(0, itemsPerPage) // Show current page matches
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const showPagination = totalCount > 0

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    onSort({ key, direction })
  }

  const toggleSelection = (matchId: number) => {
    const newSelection = new Set(selectedMatches)
    if (newSelection.has(matchId)) {
      newSelection.delete(matchId)
    } else {
      newSelection.add(matchId)
    }
    setSelectedMatches(newSelection)
  }

  const selectAll = () => {
    if (selectedMatches.size === displayedMatches.length) {
      setSelectedMatches(new Set())
    } else {
      setSelectedMatches(new Set(displayedMatches.map((m) => m.id)))
    }
  }

  const clearSelection = () => {
    setSelectedMatches(new Set())
    setIsSelectionMode(false)
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return "chevrons-up-down"
    return sortConfig.direction === "asc" ? "chevron-up" : "chevron-down"
  }

  const getResultBadge = (result: string) => {
    switch (result) {
      case "H":
        return {
          class: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30",
          icon: "circle-dot",
          text: "Hazai",
        }
      case "D":
        return {
          class: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30",
          icon: "minus",
          text: "Döntetlen",
        }
      case "A":
        return {
          class: "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30",
          icon: "circle",
          text: "Vendég",
        }
      default:
        return {
          class: "bg-zinc-500/20 text-zinc-300 ring-1 ring-zinc-500/30",
          icon: "help-circle",
          text: "N/A",
        }
    }
  }

  const getBooleanBadge = (value: string) => {
    return value === "yes"
      ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30"
      : "bg-zinc-500/20 text-zinc-400 ring-1 ring-zinc-500/30"
  }

  const scrollToResults = () => {
    const resultsSection = document.getElementById("results")
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handlePageChange = (page: number) => {
    onPageChange(page)
    setTimeout(scrollToResults, 100) // Small delay to ensure page change is processed
  }

  return (
    <section id="results" className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Listázott eredmények</h2>
          <span
            id="listedCount"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300"
          >
            <i data-lucide="table" style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}></i>
            Mérkőzések: {totalCount}
          </span>
          {selectedMatches.size > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
              <i data-lucide="check-square" style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}></i>
              {selectedMatches.size} kiválasztva
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {displayedMatches.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className="inline-flex items-center gap-2 text-xs font-medium text-zinc-200 border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors duration-200"
              >
                <i
                  data-lucide={isSelectionMode ? "x" : "check-square"}
                  style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}
                ></i>
                {isSelectionMode ? "Mégse" : "Kiválasztás"}
              </button>
              {isSelectionMode && selectedMatches.size > 0 && (
                <button
                  onClick={clearSelection}
                  className="inline-flex items-center gap-2 text-xs font-medium text-zinc-200 border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors duration-200"
                >
                  <i data-lucide="x-circle" style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}></i>
                  Törlés
                </button>
              )}
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <i data-lucide="database" style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}></i>
            <span>Supabase adatbázis</span>
          </div>
        </div>
      </div>

      {showPagination && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          position="top"
        />
      )}

      <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 bg-white/5 table-container">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-zinc-300">
              <tr className="border-b border-white/10">
                {isSelectionMode && (
                  <th className="px-4 py-3 w-12">
                    <button
                      onClick={selectAll}
                      className="inline-flex items-center justify-center w-5 h-5 rounded border border-white/20 hover:bg-white/5 transition-colors"
                    >
                      {selectedMatches.size === displayedMatches.length && displayedMatches.length > 0 && (
                        <i
                          data-lucide="check"
                          style={{ width: "12px", height: "12px", strokeWidth: "2" }}
                          className="text-violet-400"
                        ></i>
                      )}
                    </button>
                  </th>
                )}
                <th
                  data-sort-key="home"
                  onClick={() => handleSort("home")}
                  className={`text-left font-medium px-4 py-3 cursor-pointer select-none hover:bg-white/5 transition-colors duration-200 ${
                    sortConfig.key === "home" ? `sorted-${sortConfig.direction}` : ""
                  }`}
                >
                  <div className="inline-flex items-center gap-1">
                    Hazai csapat
                    <i
                      data-lucide={getSortIcon("home")}
                      className={`opacity-60 transition-all duration-200 ${sortConfig.key === "home" ? "opacity-100 text-violet-400" : ""}`}
                      style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}
                    ></i>
                  </div>
                </th>
                <th
                  data-sort-key="away"
                  onClick={() => handleSort("away")}
                  className={`text-left font-medium px-4 py-3 cursor-pointer select-none hover:bg-white/5 transition-colors duration-200 ${
                    sortConfig.key === "away" ? `sorted-${sortConfig.direction}` : ""
                  }`}
                >
                  <div className="inline-flex items-center gap-1">
                    Vendég csapat
                    <i
                      data-lucide={getSortIcon("away")}
                      className={`opacity-60 transition-all duration-200 ${sortConfig.key === "away" ? "opacity-100 text-violet-400" : ""}`}
                      style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}
                    ></i>
                  </div>
                </th>
                <th
                  data-sort-key="ht"
                  onClick={() => handleSort("ht")}
                  className={`text-left font-medium px-4 py-3 cursor-pointer select-none hover:bg-white/5 transition-colors duration-200 ${
                    sortConfig.key === "ht" ? `sorted-${sortConfig.direction}` : ""
                  }`}
                >
                  <div className="inline-flex items-center gap-1">
                    Félidő eredmény
                    <i
                      data-lucide={getSortIcon("ht")}
                      className={`opacity-60 transition-all duration-200 ${sortConfig.key === "ht" ? "opacity-100 text-violet-400" : ""}`}
                      style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}
                    ></i>
                  </div>
                </th>
                <th
                  data-sort-key="ft"
                  onClick={() => handleSort("ft")}
                  className={`text-left font-medium px-4 py-3 cursor-pointer select-none hover:bg-white/5 transition-colors duration-200 ${
                    sortConfig.key === "ft" ? `sorted-${sortConfig.direction}` : ""
                  }`}
                >
                  <div className="inline-flex items-center gap-1">
                    Végeredmény
                    <i
                      data-lucide={getSortIcon("ft")}
                      className={`opacity-60 transition-all duration-200 ${sortConfig.key === "ft" ? "opacity-100 text-violet-400" : ""}`}
                      style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}
                    ></i>
                  </div>
                </th>
                <th
                  data-sort-key="btts"
                  onClick={() => handleSort("btts")}
                  className={`text-left font-medium px-4 py-3 cursor-pointer select-none hover:bg-white/5 transition-colors duration-200 ${
                    sortConfig.key === "btts" ? `sorted-${sortConfig.direction}` : ""
                  }`}
                >
                  <div className="inline-flex items-center gap-1">
                    Mindkét csapat gólt szerzett
                    <i
                      data-lucide={getSortIcon("btts")}
                      className={`opacity-60 transition-all duration-200 ${sortConfig.key === "btts" ? "opacity-100 text-violet-400" : ""}`}
                      style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}
                    ></i>
                  </div>
                </th>
                <th
                  data-sort-key="comeback"
                  onClick={() => handleSort("comeback")}
                  className={`text-left font-medium px-4 py-3 cursor-pointer select-none hover:bg-white/5 transition-colors duration-200 ${
                    sortConfig.key === "comeback" ? `sorted-${sortConfig.direction}` : ""
                  }`}
                >
                  <div className="inline-flex items-center gap-1">
                    Fordítás történt
                    <i
                      data-lucide={getSortIcon("comeback")}
                      className={`opacity-60 transition-all duration-200 ${sortConfig.key === "comeback" ? "opacity-100 text-violet-400" : ""}`}
                      style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}
                    ></i>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody id="resultsBody" className="divide-y divide-white/5">
              {displayedMatches.map((match, index) => {
                const resultBadge = getResultBadge(match.result)
                const isSelected = selectedMatches.has(match.id)

                return (
                  <tr
                    key={match.id || index}
                    className={`transition-all duration-150 ${
                      isSelected ? "bg-violet-500/10 ring-1 ring-violet-400/30" : "hover:bg-white/5"
                    } ${isSelectionMode ? "cursor-pointer" : ""}`}
                    onClick={() => isSelectionMode && toggleSelection(match.id)}
                  >
                    {isSelectionMode && (
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelection(match.id)
                          }}
                          className="inline-flex items-center justify-center w-5 h-5 rounded border border-white/20 hover:bg-white/5 transition-colors"
                        >
                          {isSelected && (
                            <i
                              data-lucide="check"
                              style={{ width: "12px", height: "12px", strokeWidth: "2" }}
                              className="text-violet-400"
                            ></i>
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3 text-zinc-200 font-medium">
                      <div className="flex items-center gap-2">
                        <TeamLogo teamName={match.home} size="md" />
                        <span>{match.home || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-200 font-medium">
                      <div className="flex items-center gap-2">
                        <TeamLogo teamName={match.away} size="md" />
                        <span>{match.away || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{match.ht || "N/A"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-200 font-medium">{match.ft || "N/A"}</span>
                        {match.result && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${resultBadge.class}`}
                            title={resultBadge.text}
                          >
                            <i
                              data-lucide={resultBadge.icon}
                              style={{ width: "12px", height: "12px", strokeWidth: "1.5" }}
                            ></i>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBooleanBadge(match.btts)}`}
                        title="Mindkét csapat gólt szerzett"
                      >
                        <i
                          data-lucide={match.btts === "yes" ? "target" : "minus"}
                          style={{ width: "12px", height: "12px", strokeWidth: "1.5" }}
                        ></i>
                        {match.btts === "yes" ? "Igen" : match.btts === "no" ? "Nem" : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBooleanBadge(match.comeback)}`}
                        title="Fordítás történt"
                      >
                        <i
                          data-lucide={match.comeback === "yes" ? "shuffle" : "minus"}
                          style={{ width: "12px", height: "12px", strokeWidth: "1.5" }}
                        ></i>
                        {match.comeback === "yes" ? "Igen" : match.comeback === "no" ? "Nem" : "N/A"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div
          id="noResultsMessage"
          className={`px-6 py-10 text-center text-sm text-zinc-300 ${displayedMatches.length > 0 ? "hidden" : ""}`}
        >
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/5 ring-1 ring-white/10 mb-4">
            <i
              data-lucide="search-x"
              style={{ width: "20px", height: "20px", strokeWidth: "1.5" }}
              className="text-zinc-400"
            ></i>
          </div>
          <h3 className="font-medium text-zinc-200 mb-2">Nincs találat</h3>
          <p className="text-zinc-400">
            Nincs találat a megadott szűrőkkel. Módosítsd a feltételeket vagy próbálj más keresési kritériumokat.
          </p>
        </div>
      </div>

      {showPagination && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          position="bottom"
        />
      )}
    </section>
  )
}
