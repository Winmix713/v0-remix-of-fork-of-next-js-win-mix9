"use client"

import { useEffect } from "react"
import { TeamLogo } from "./team-logo"

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

interface MatchRowProps {
  match: Match
  index: number
}

export function MatchRow({ match, index }: MatchRowProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  const getResultBadge = (result: string) => {
    switch (result) {
      case "H":
        return {
          class: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30",
          icon: "circle-dot",
        }
      case "D":
        return {
          class: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30",
          icon: "minus",
        }
      case "A":
        return {
          class: "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30",
          icon: "circle",
        }
      default:
        return {
          class: "bg-zinc-500/20 text-zinc-300 ring-1 ring-zinc-500/30",
          icon: "help-circle",
        }
    }
  }

  const getBooleanBadge = (value: string) => {
    return value === "yes"
      ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30"
      : "bg-zinc-500/20 text-zinc-400 ring-1 ring-zinc-500/30"
  }

  const resultBadge = getResultBadge(match.result)

  return (
    <tr key={match.id || index} className="hover:bg-white/5 transition-colors duration-150">
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
      <td className="px-4 py-3 text-zinc-200">{match.ht || "N/A"}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-zinc-200">{match.ft || "N/A"}</span>
          {match.result && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${resultBadge.class}`}
            >
              <i data-lucide={resultBadge.icon} style={{ width: "12px", height: "12px", strokeWidth: "1.5" }}></i>
              {match.result}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBooleanBadge(match.btts)}`}
        >
          {match.btts === "yes" ? "Igen" : match.btts === "no" ? "Nem" : "N/A"}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBooleanBadge(match.comeback)}`}
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
}
