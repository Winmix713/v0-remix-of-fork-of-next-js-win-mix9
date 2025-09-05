"use client"

import { useEffect } from "react"

interface ExtendedStatsModalProps {
  isOpen: boolean
  onClose: () => void
  matches: any[]
  filters: {
    homeTeam: string
    awayTeam: string
    btts: string
    comeback: string
  }
}

export function ExtendedStatsModal({ isOpen, onClose, matches, filters }: ExtendedStatsModalProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const homeWins = matches.filter((m) => m.result === "H").length
  const draws = matches.filter((m) => m.result === "D").length
  const awayWins = matches.filter((m) => m.result === "A").length
  const totalMatches = matches.length

  // Calculate goal averages from ft scores
  let totalHomeGoals = 0
  let totalAwayGoals = 0
  const resultCounts: { [key: string]: number } = {}

  matches.forEach((match) => {
    if (match.ft && typeof match.ft === "string") {
      const [homeGoals, awayGoals] = match.ft.split("-").map((g: string) => Number.parseInt(g, 10) || 0)
      totalHomeGoals += homeGoals
      totalAwayGoals += awayGoals

      // Count result frequencies
      resultCounts[match.ft] = (resultCounts[match.ft] || 0) + 1
    }
  })

  const homeGoalAvg = totalMatches > 0 ? (totalHomeGoals / totalMatches).toFixed(1) : "0.0"
  const awayGoalAvg = totalMatches > 0 ? (totalAwayGoals / totalMatches).toFixed(1) : "0.0"

  const bttsMatches = matches.filter((m) => m.btts === "yes").length
  const bttsPercentage = totalMatches > 0 ? Math.round((bttsMatches / totalMatches) * 100) : 0

  // Get most frequent results
  const sortedResults = Object.entries(resultCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const getTeamLogo = (teamName: string) => {
    const teamLogos: { [key: string]: string } = {
      Barcelona:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/FC_Barcelona_%28crest%29.svg/500px-FC_Barcelona_%28crest%29.svg.png",
      "Madrid Fehér":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Real_Madrid_CF.svg/500px-Real_Madrid_CF.svg.png",
      "Madrid Piros":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Atletico_Madrid_2017_logo.svg/500px-Atletico_Madrid_2017_logo.svg.png",
      Bilbao:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Athletic_Bilbao.svg/500px-Athletic_Bilbao.svg.png",
      "Sevilla Piros":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Sevilla_FC_logo.svg/500px-Sevilla_FC_logo.svg.png",
      Valencia: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Valenciacf.svg/500px-Valenciacf.svg.png",
      Villarreal:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Villarreal_CF_logo-en.svg/500px-Villarreal_CF_logo-en.svg.png",
      "San Sebastian":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Real_Sociedad_logo.svg/500px-Real_Sociedad_logo.svg.png",
      Getafe: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Getafe_logo.svg/500px-Getafe_logo.svg.png",
      Alaves:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Deportivo_Alav%C3%A9s_logo.svg/500px-Deportivo_Alav%C3%A9s_logo.svg.png",
      "Las Palmas":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/UD_Las_Palmas_logo.svg/500px-UD_Las_Palmas_logo.svg.png",
      Girona:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Girona_FC_logo.svg/500px-Girona_FC_logo.svg.png",
      Mallorca: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/RCD_Mallorca.svg/500px-RCD_Mallorca.svg.png",
      Osasuna:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/CA_Osasuna_logo.svg/500px-CA_Osasuna_logo.svg.png",
      "Sevilla Zöld":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Real_Betis_logo.svg/500px-Real_Betis_logo.svg.png",
      Vigo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/RC_Celta_de_Vigo_logo.svg/500px-RC_Celta_de_Vigo_logo.svg.png",
    }

    return teamLogos[teamName] || `/placeholder.svg?height=40&width=40&text=${encodeURIComponent(teamName.charAt(0))}`
  }

  return (
    <div id="extendedStatsModal" className="fixed z-[80] inset-0">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative mx-auto my-10 w-full max-w-3xl px-4">
        <div className="rounded-2xl ring-1 ring-white/10 bg-[#0c0f16] shadow-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i
                  data-lucide="chart-line"
                  className="text-violet-300"
                  style={{ width: "20px", height: "20px", strokeWidth: "1.5" }}
                ></i>
                <h3 className="text-2xl font-semibold tracking-tight">Bővített statisztika</h3>
              </div>
              <button
                id="closeModalX"
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <i data-lucide="x" style={{ width: "22px", height: "22px", strokeWidth: "1.5" }}></i>
              </button>
            </div>

            <div
              id="selectedTeams"
              className="mt-6 grid grid-cols-1 sm:grid-cols-3 items-center gap-4 rounded-xl bg-white/5 ring-1 ring-white/10 p-4"
            >
              <div id="homeTeamInfo" className="flex items-center gap-3">
                <img
                  src={filters.homeTeam ? getTeamLogo(filters.homeTeam) : "/abstract-team-logo.png"}
                  alt="Hazai csapat logó"
                  className="h-10 w-10 rounded-full ring-1 ring-white/10 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `/placeholder.svg?height=40&width=40&text=${encodeURIComponent((filters.homeTeam || "?").charAt(0))}`
                  }}
                />
                <div>
                  <div className="font-medium text-white">{filters.homeTeam || "Összes csapat"}</div>
                  <div className="text-xs text-zinc-400">Hazai csapat</div>
                </div>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 text-zinc-300">
                  <i data-lucide="circle-dot" style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}></i>
                  vs
                  <i data-lucide="circle" style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}></i>
                </span>
              </div>
              <div id="awayTeamInfo" className="flex items-center justify-end gap-3">
                <div className="text-right">
                  <div className="font-medium text-white">{filters.awayTeam || "Összes csapat"}</div>
                  <div className="text-xs text-zinc-400">Vendég csapat</div>
                </div>
                <img
                  src={filters.awayTeam ? getTeamLogo(filters.awayTeam) : "/abstract-team-logo.png"}
                  alt="Vendég csapat logó"
                  className="h-10 w-10 rounded-full ring-1 ring-white/10 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `/placeholder.svg?height=40&width=40&text=${encodeURIComponent((filters.awayTeam || "?").charAt(0))}`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/30 p-4 text-center stats-card">
                <div id="totalMatches" className="text-2xl font-semibold tracking-tight text-emerald-300">
                  {totalMatches}
                </div>
                <div className="text-xs text-emerald-200 mt-1">Mérkőzések száma</div>
              </div>
              <div className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/30 p-4 text-center stats-card">
                <div id="homeWins" className="text-2xl font-semibold tracking-tight text-emerald-300">
                  {homeWins}
                </div>
                <div className="text-xs text-emerald-200 mt-1">Hazai győzelmek</div>
              </div>
              <div className="rounded-xl bg-amber-500/10 ring-1 ring-amber-400/30 p-4 text-center stats-card">
                <div id="draws" className="text-2xl font-semibold tracking-tight text-amber-300">
                  {draws}
                </div>
                <div className="text-xs text-amber-200 mt-1">Döntetlenek</div>
              </div>
              <div className="rounded-xl bg-sky-500/10 ring-1 ring-sky-400/30 p-4 text-center stats-card">
                <div id="awayWins" className="text-2xl font-semibold tracking-tight text-sky-300">
                  {awayWins}
                </div>
                <div className="text-xs text-sky-200 mt-1">Vendég győzelmek</div>
              </div>
              <div className="rounded-xl bg-violet-500/10 ring-1 ring-violet-400/30 p-4 text-center stats-card">
                <div id="homeGoalAvg" className="text-2xl font-semibold tracking-tight text-violet-300">
                  {homeGoalAvg}
                </div>
                <div className="text-xs text-violet-200 mt-1">Hazai gól átlag</div>
              </div>
              <div className="rounded-xl bg-indigo-500/10 ring-1 ring-indigo-400/30 p-4 text-center stats-card">
                <div id="awayGoalAvg" className="text-2xl font-semibold tracking-tight text-indigo-300">
                  {awayGoalAvg}
                </div>
                <div className="text-xs text-indigo-200 mt-1">Vendég gól átlag</div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
              <div id="bothTeamsScored" className="text-sm text-zinc-300">
                Összes mérkőzésből hány mérkőzésen szerzett mind a két csapat gólt:{" "}
                <span className="font-semibold text-violet-300">{bttsPercentage}%</span>
                <div className="mt-2 text-xs text-zinc-400">
                  ({bttsMatches} mérkőzés {totalMatches} mérkőzésből)
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-zinc-200 mb-2 inline-flex items-center gap-2">
                <i data-lucide="trophy" style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}></i>
                Leggyakoribb eredmények
              </h4>
              <ol id="frequentResultsList" className="list-decimal list-inside space-y-1 text-sm text-zinc-300">
                {sortedResults.length > 0 ? (
                  sortedResults.map(([result, count], index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>
                        {result} - {count} alkalommal
                      </span>
                      <span className="text-xs text-zinc-400">
                        ({totalMatches > 0 ? Math.round((count / totalMatches) * 100) : 0}%)
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-400 italic">Nincs adat</li>
                )}
              </ol>
            </div>

            {totalMatches > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                  <h5 className="font-medium text-zinc-200 mb-2 text-sm">Eredmény megoszlás</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-300">Hazai győzelem:</span>
                      <span className="text-emerald-300">{Math.round((homeWins / totalMatches) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-300">Döntetlen:</span>
                      <span className="text-amber-300">{Math.round((draws / totalMatches) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-300">Vendég győzelem:</span>
                      <span className="text-sky-300">{Math.round((awayWins / totalMatches) * 100)}%</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                  <h5 className="font-medium text-zinc-200 mb-2 text-sm">Gól statisztikák</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-300">Összes gól:</span>
                      <span className="text-violet-300">{totalHomeGoals + totalAwayGoals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-300">Meccsenkénti átlag:</span>
                      <span className="text-violet-300">
                        {((totalHomeGoals + totalAwayGoals) / totalMatches).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-300">Fordítások:</span>
                      <span className="text-fuchsia-300">{matches.filter((m) => m.comeback === "yes").length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-white/10 flex justify-end">
            <button
              type="button"
              id="closeModal"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-zinc-200 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <i data-lucide="x" style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}></i>
              Bezárás
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
