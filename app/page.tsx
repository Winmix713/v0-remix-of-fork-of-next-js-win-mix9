"use client"

import { useState, useEffect, useCallback } from "react"
import { SplineBackground } from "@/components/spline-background"
import { LoadingOverlay } from "@/components/loading-overlay"
import { ToastContainer, useToast } from "@/components/toast-container"
import { Header } from "@/components/header"
import { FilterSection } from "@/components/filter-section"
import { StatsSection } from "@/components/stats-section"
import { ResultsSection } from "@/components/results-section"
import { Footer } from "@/components/footer"
import { ExtendedStatsModal } from "@/components/extended-stats-modal"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { GlobalScriptLoader } from "@/components/global-script-loader"
import { createClient } from "@/lib/supabase/client"

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

interface Filters {
  homeTeam: string
  awayTeam: string
  btts: string
  comeback: string
}

interface Stats {
  total: number
  home: number
  draw: number
  away: number
  bttsYes: number
  bttsNo: number
  comebacks: number
}

interface SortConfig {
  key: string
  direction: "asc" | "desc" | ""
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  return [storedValue, setValue] as const
}

const transformSupabaseMatch = (match: any): Match => {
  const ht = `${match.half_time_home_goals ?? 0}-${match.half_time_away_goals ?? 0}`
  const ft = `${match.full_time_home_goals ?? 0}-${match.full_time_away_goals ?? 0}`

  const getResult = (homeGoals: number, awayGoals: number): string => {
    if (homeGoals > awayGoals) return "H"
    if (awayGoals > homeGoals) return "A"
    return "D"
  }

  const getBTTS = (homeGoals: number, awayGoals: number): string => {
    return homeGoals > 0 && awayGoals > 0 ? "yes" : "no"
  }

  const getComeback = (htHome: number, htAway: number, ftHome: number, ftAway: number): string => {
    const htResult = htHome > htAway ? "H" : htHome < htAway ? "A" : "D"
    const ftResult = ftHome > ftAway ? "H" : ftHome < ftAway ? "A" : "D"
    return htResult !== "D" && ftResult !== "D" && htResult !== ftResult ? "yes" : "no"
  }

  return {
    id: match.id,
    home: match.home_team,
    away: match.away_team,
    ht,
    ft,
    btts: getBTTS(match.full_time_home_goals, match.full_time_away_goals),
    comeback: getComeback(
      match.half_time_home_goals ?? 0,
      match.half_time_away_goals ?? 0,
      match.full_time_home_goals,
      match.full_time_away_goals,
    ),
    result: getResult(match.full_time_home_goals, match.full_time_away_goals),
    date: new Date(match.created_at).toISOString().split("T")[0],
    match_time: match.match_time,
    league: match.league,
    season: match.season,
  }
}

const generateSampleData = (): Match[] => {
  const teams = [
    "Ferencváros",
    "Újpest",
    "Debrecen",
    "Paks",
    "Videoton",
    "Honvéd",
    "Kisvárda",
    "Zalaegerszeg",
    "Diósgyőr",
    "Gyirmót",
    "Budafok",
    "Soroksár",
    "Barcelona",
    "Real Madrid",
    "Atletico Madrid",
    "Sevilla",
    "Valencia",
    "Villarreal",
    "Real Sociedad",
    "Athletic Bilbao",
    "Celta Vigo",
    "Getafe",
  ]

  const sampleMatches: Match[] = []
  const baseDate = new Date("2024-01-01")

  for (let i = 0; i < 2500; i++) {
    const homeGoals = Math.floor(Math.random() * 5)
    const awayGoals = Math.floor(Math.random() * 5)
    const htHomeGoals = Math.floor(Math.random() * (homeGoals + 1))
    const htAwayGoals = Math.floor(Math.random() * (awayGoals + 1))

    const ht = `${htHomeGoals}-${htAwayGoals}`
    const ft = `${homeGoals}-${awayGoals}`

    const getResult = (home: number, away: number): string => {
      if (home > away) return "H"
      if (home < away) return "A"
      return "D"
    }

    const getBTTS = (home: number, away: number): string => {
      return home > 0 && away > 0 ? "yes" : "no"
    }

    const getComeback = (htHome: number, htAway: number, ftHome: number, ftAway: number): string => {
      const htResult = htHome > htAway ? "H" : htHome < htAway ? "A" : "D"
      const ftResult = ftHome > ftAway ? "H" : ftHome < ftAway ? "A" : "D"

      return htResult !== "D" && ftResult !== "D" && htResult !== ftResult ? "yes" : "no"
    }

    const matchDate = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000) / 5)
    const home = teams[Math.floor(Math.random() * teams.length)]
    let away = teams[Math.floor(Math.random() * teams.length)]

    // Ensure home and away teams are different
    while (away === home) {
      away = teams[Math.floor(Math.random() * teams.length)]
    }

    sampleMatches.push({
      id: i + 1,
      home,
      away,
      ht,
      ft,
      btts: getBTTS(homeGoals, awayGoals),
      comeback: getComeback(htHomeGoals, htAwayGoals, homeGoals, awayGoals),
      result: getResult(homeGoals, awayGoals),
      date: matchDate.toISOString().split("T")[0],
      match_time: matchDate.toISOString(),
      league: "Sample League",
      season: "2024",
    })
  }

  return sampleMatches
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useLocalStorage<Filters>("winmix_filters_v2", {
    homeTeam: "",
    awayTeam: "",
    btts: "",
    comeback: "",
  })
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    home: 0,
    draw: 0,
    away: 0,
    bttsYes: 0,
    bttsNo: 0,
    comebacks: 0,
  })
  const [teams, setTeams] = useState<string[]>([])
  const [showExtendedModal, setShowExtendedModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useLocalStorage("winmix_items_per_page", 50)
  const [sortConfig, setSortConfig] = useLocalStorage<SortConfig>("winmix_sort_config", { key: "", direction: "" })
  const [totalCount, setTotalCount] = useState(0)
  const [dataSource, setDataSource] = useState<"supabase" | "sample">("supabase")
  const { showSuccess, showError, showInfo } = useToast()

  // Initialize Lucide icons when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Starting loadInitialData")

      try {
        const supabase = createClient()
        console.log("[v0] Supabase client created successfully")

        // Test connection first
        const { data: testData, error: testError } = await supabase
          .from("matches")
          .select("count", { count: "exact", head: true })

        if (testError) {
          throw testError
        }

        console.log("[v0] Supabase connection successful, total matches:", testData)

        // Load teams for dropdowns
        const { data: teamsData, error: teamsError } = await supabase.from("matches").select("home_team, away_team")

        if (teamsError) {
          throw teamsError
        }

        console.log("[v0] Teams data fetched:", teamsData?.length, "records")

        const uniqueTeams = new Set<string>()
        teamsData?.forEach((match) => {
          uniqueTeams.add(match.home_team)
          uniqueTeams.add(match.away_team)
        })
        setTeams(Array.from(uniqueTeams).sort())
        console.log("[v0] Unique teams processed:", uniqueTeams.size, "teams")

        setDataSource("supabase")
        await loadMatches()
        await loadStats()

        console.log("[v0] Initial data loading completed")
      } catch (supabaseError) {
        console.error("[v0] Supabase error, falling back to sample data:", supabaseError)
        await loadSampleData()
      }
    } catch (error) {
      console.error("[v0] Error loading initial data:", error)
      await loadSampleData()
    } finally {
      setIsLoading(false)
    }
  }

  const loadSampleData = async () => {
    console.log("[v0] Loading sample data as fallback")

    const sampleMatches = generateSampleData()
    const sampleTeams = Array.from(
      new Set([...sampleMatches.map((m) => m.home), ...sampleMatches.map((m) => m.away)]),
    ).sort()

    setMatches(sampleMatches)
    setTeams(sampleTeams)
    setDataSource("sample")

    // Apply filters to sample data
    applyFiltersToMatches(sampleMatches)
    calculateStats(sampleMatches)

    showInfo("Minta adatok betöltve", "Az adatbázis kapcsolat nem elérhető, minta adatokkal dolgozunk.")
  }

  const loadMatches = async (page = 1) => {
    if (dataSource === "sample") {
      // Handle sample data pagination
      applyFiltersToMatches(matches)
      return
    }

    try {
      const supabase = createClient()
      let query = supabase.from("matches").select("*", { count: "exact" }).order("created_at", { ascending: false })

      // Apply server-side filtering for better performance
      if (filters.homeTeam) {
        query = query.eq("home_team", filters.homeTeam)
      }
      if (filters.awayTeam) {
        query = query.eq("away_team", filters.awayTeam)
      }

      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      const transformedMatches: Match[] = (data || []).map(transformSupabaseMatch)

      // Apply client-side filtering for BTTS and comeback
      let filtered = transformedMatches
      if (filters.btts && filters.btts !== "") {
        filtered = filtered.filter((match) => match.btts === filters.btts)
      }
      if (filters.comeback && filters.comeback !== "") {
        filtered = filtered.filter((match) => match.comeback === filters.comeback)
      }

      setMatches(transformedMatches)
      setFilteredMatches(filtered)
      setTotalCount(count || 0)
    } catch (error) {
      console.error("Error loading matches:", error)
      showError("Hiba a mérkőzések betöltése során", "Próbáld újra később.")
    }
  }

  const applyFiltersToMatches = useCallback(
    (matchData: Match[]) => {
      let filtered = [...matchData]

      if (filters.homeTeam) {
        filtered = filtered.filter((m) => m.home === filters.homeTeam)
      }

      if (filters.awayTeam) {
        filtered = filtered.filter((m) => m.away === filters.awayTeam)
      }

      if (filters.btts && filters.btts !== "") {
        filtered = filtered.filter((m) => m.btts === filters.btts)
      }

      if (filters.comeback && filters.comeback !== "") {
        filtered = filtered.filter((m) => m.comeback === filters.comeback)
      }

      // Apply sorting
      if (sortConfig.key && sortConfig.direction) {
        filtered = sortMatches(filtered, sortConfig)
      }

      setFilteredMatches(filtered)
      setTotalCount(filtered.length)
    },
    [filters, sortConfig],
  )

  const sortMatches = (matchesToSort: Match[], config: SortConfig): Match[] => {
    if (!config.key || !config.direction) return matchesToSort

    return [...matchesToSort].sort((a, b) => {
      let result = 0

      switch (config.key) {
        case "home":
        case "away":
          result = a[config.key as keyof Match].toString().localeCompare(b[config.key as keyof Match].toString(), "hu")
          break

        case "ht":
        case "ft":
          const [aHome, aAway] = a[config.key].split("-").map((n) => Number.parseInt(n, 10))
          const [bHome, bAway] = b[config.key].split("-").map((n) => Number.parseInt(n, 10))
          result = aHome + aAway - (bHome + bAway)
          if (result === 0) result = aHome - bHome
          break

        case "btts":
        case "comeback":
          result = (a[config.key] === "yes" ? 1 : 0) - (b[config.key] === "yes" ? 1 : 0)
          break

        case "result":
          const resultOrder = { H: 0, D: 1, A: 2 }
          result =
            (resultOrder[a.result as keyof typeof resultOrder] || 3) -
            (resultOrder[b.result as keyof typeof resultOrder] || 3)
          break
      }

      return config.direction === "asc" ? result : -result
    })
  }

  const calculateStats = useCallback((matchData: Match[]) => {
    const total = matchData.length
    const home = matchData.filter((m) => m.result === "H").length
    const draw = matchData.filter((m) => m.result === "D").length
    const away = matchData.filter((m) => m.result === "A").length
    const bttsYes = matchData.filter((m) => m.btts === "yes").length
    const bttsNo = total - bttsYes
    const comebacks = matchData.filter((m) => m.comeback === "yes").length

    setStats({ total, home, draw, away, bttsYes, bttsNo, comebacks })
  }, [])

  const loadStats = async () => {
    if (dataSource === "sample") {
      calculateStats(matches)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("matches").select("*")

      if (error) throw error

      const transformedMatches = (data || []).map(transformSupabaseMatch)
      calculateStats(transformedMatches)
    } catch (error) {
      console.error("Error loading stats:", error)
      showError("Hiba a statisztikák betöltése során", "Próbáld újra később.")
    }
  }

  const applyFilters = useCallback(async () => {
    setIsLoading(true)
    setCurrentPage(1)

    if (dataSource === "sample") {
      applyFiltersToMatches(matches)
      setTimeout(() => {
        calculateStats(filteredMatches)
      }, 100) // Small delay to ensure filteredMatches is updated
    } else {
      await loadMatches(1)
      await loadStats()
    }

    setIsLoading(false)
  }, [filters, dataSource, matches, applyFiltersToMatches, filteredMatches])

  const resetFilters = async () => {
    const defaultFilters = {
      homeTeam: "",
      awayTeam: "",
      btts: "",
      comeback: "",
    }

    setFilters(defaultFilters)
    setSortConfig({ key: "", direction: "" })
    setCurrentPage(1)

    if (dataSource === "sample") {
      applyFiltersToMatches(matches)
      calculateStats(matches)
    } else {
      await loadMatches(1)
      await loadStats()
    }

    showInfo("Szűrők visszaállítva", "Minden szűrő törölve lett")
  }

  const handlePageChange = async (page: number) => {
    setCurrentPage(page)
    if (dataSource === "supabase") {
      await loadMatches(page)
    }
  }

  const handleSort = (config: SortConfig) => {
    setSortConfig(config)
    if (dataSource === "sample") {
      const sorted = sortMatches(filteredMatches, config)
      setFilteredMatches(sorted)
    }
  }

  const exportToCSV = () => {
    try {
      if (filteredMatches.length === 0) {
        showError("Nincs exportálható adat", "Alkalmazz szűrőket vagy töltsd be az adatokat")
        return
      }

      const headers = [
        "Hazai csapat",
        "Vendég csapat",
        "Félidő eredmény",
        "Végeredmény",
        "Eredmény",
        "BTTS",
        "Fordítás",
        "Dátum",
        "Liga",
        "Szezon",
      ]

      const csvRows = filteredMatches.map((match) => {
        const escapeCSV = (value: string | undefined) => {
          if (!value) return '""'
          const escaped = value.toString().replace(/"/g, '""')
          return `"${escaped}"`
        }

        return [
          escapeCSV(match.home),
          escapeCSV(match.away),
          escapeCSV(match.ht),
          escapeCSV(match.ft),
          escapeCSV(match.result === "H" ? "Hazai" : match.result === "A" ? "Vendég" : "Döntetlen"),
          escapeCSV(match.btts === "yes" ? "Igen" : "Nem"),
          escapeCSV(match.comeback === "yes" ? "Igen" : "Nem"),
          escapeCSV(match.date || new Date().toISOString().split("T")[0]),
          escapeCSV(match.league || "N/A"),
          escapeCSV(match.season || "N/A"),
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

      if (filters.homeTeam || filters.awayTeam) {
        const teams = [filters.homeTeam, filters.awayTeam].filter(Boolean).join("-vs-")
        filename += `-${teams.replace(/[^a-zA-Z0-9-]/g, "")}`
      }

      if (filters.btts && filters.btts !== "") {
        filename += `-btts-${filters.btts}`
      }

      if (filters.comeback && filters.comeback !== "") {
        filename += `-comeback-${filters.comeback}`
      }

      link.setAttribute("download", `${filename}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      showSuccess("CSV export sikeres", `${filteredMatches.length} mérkőzés exportálva`)
    } catch (error) {
      console.error("CSV export error:", error)
      showError("Export hiba", "Hiba történt a CSV fájl létrehozása során")
    }
  }

  // Apply filters when dependencies change
  useEffect(() => {
    if (matches.length > 0) {
      applyFiltersToMatches(matches)
    }
  }, [filters, sortConfig, applyFiltersToMatches])

  // Apply filters when dependencies change
  useEffect(() => {
    if (filteredMatches.length >= 0) {
      calculateStats(filteredMatches)
    }
  }, [filteredMatches, calculateStats])

  return (
    <div className="min-h-screen">
      <GlobalScriptLoader />
      <SplineBackground />
      <LoadingOverlay isVisible={isLoading} />
      <ToastContainer />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] rounded-full blur-3xl opacity-35 bg-[radial-gradient(closest-side,rgba(138,92,246,0.5),rgba(10,10,18,0))]"></div>
        <div className="absolute -bottom-20 -right-20 w-[800px] h-[800px] rounded-full blur-3xl opacity-30 bg-[radial-gradient(closest-side,rgba(99,102,241,0.4),rgba(10,10,18,0))]"></div>
      </div>

      <Header onSearch={applyFilters} onExtendedStats={() => setShowExtendedModal(true)} />

      <main className="relative z-10">
        <section className="bg-black/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="text-center space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white text-balance">
                Mérkőzés szűrő és statisztikák
              </h1>
              <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-300 text-pretty">
                Szűrd a meccseket csapatokra és eseményekre, elemezd a kimeneteleket, és exportáld CSV-be.
              </p>
              {dataSource === "sample" && (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30 px-3 py-1.5 text-xs">
                  <i data-lucide="alert-triangle" style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}></i>
                  Minta adatok használatban
                </div>
              )}
            </div>

            <FilterSection
              filters={filters}
              onFiltersChange={setFilters}
              onApply={applyFilters}
              onReset={resetFilters}
              onExport={exportToCSV}
              teams={teams}
            />

            <StatsSection stats={stats} matches={filteredMatches} onExtendedStats={() => setShowExtendedModal(true)} />

            <ResultsSection
              matches={filteredMatches}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              sortConfig={sortConfig}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              onItemsPerPageChange={setItemsPerPage}
              onSort={handleSort}
            />
          </div>
        </section>
      </main>

      <Footer />

      <ExtendedStatsModal
        isOpen={showExtendedModal}
        onClose={() => setShowExtendedModal(false)}
        matches={filteredMatches}
        filters={filters}
      />

      <KeyboardShortcuts
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
        onExportCSV={exportToCSV}
        onExtendedStats={() => setShowExtendedModal(true)}
      />
    </div>
  )
}
