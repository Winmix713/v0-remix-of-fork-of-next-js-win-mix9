export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatScore(homeScore: number, awayScore: number): string {
  return `${homeScore} - ${awayScore}`
}

export function formatTeamName(team: string): string {
  return team.trim().replace(/\s+/g, " ")
}
