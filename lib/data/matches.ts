import { createClient } from "@/lib/supabase/server"
import type { Match, MatchFilter, Statistics } from "@/lib/types/match"

export async function getMatches(
  filter?: MatchFilter,
  page = 1,
  limit = 50,
): Promise<{ data: Match[]; count: number; error?: string }> {
  try {
    const supabase = await createClient()

    let query = supabase.from("matches").select("*", { count: "exact" }).order("created_at", { ascending: false })

    // Apply server-side filtering
    if (filter?.homeTeam) {
      query = query.eq("home_team", filter.homeTeam)
    }
    if (filter?.awayTeam) {
      query = query.eq("away_team", filter.awayTeam)
    }
    if (filter?.league) {
      query = query.eq("league", filter.league)
    }
    if (filter?.dateRange) {
      query = query
        .gte("created_at", filter.dateRange.from.toISOString())
        .lte("created_at", filter.dateRange.to.toISOString())
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return { data: [], count: 0, error: error.message }
    }

    const transformedMatches: Match[] = (data || []).map(transformSupabaseMatch)

    // Apply client-side filtering for BTTS and comeback
    let filtered = transformedMatches
    if (filter?.btts !== undefined) {
      filtered = filtered.filter((match) => match.btts === filter.btts)
    }
    if (filter?.comeback !== undefined) {
      filtered = filtered.filter((match) => match.comeback === filter.comeback)
    }

    return { data: filtered, count: count || 0 }
  } catch (error) {
    console.error("Error fetching matches:", error)
    return { data: [], count: 0, error: "Failed to fetch matches" }
  }
}

export async function getTeams(): Promise<{ data: string[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("matches").select("home_team, away_team")

    if (error) {
      return { data: [], error: error.message }
    }

    const uniqueTeams = new Set<string>()
    data?.forEach((match) => {
      uniqueTeams.add(match.home_team)
      uniqueTeams.add(match.away_team)
    })

    return { data: Array.from(uniqueTeams).sort() }
  } catch (error) {
    console.error("Error fetching teams:", error)
    return { data: [], error: "Failed to fetch teams" }
  }
}

export async function getStatistics(filter?: MatchFilter): Promise<{ data: Statistics; error?: string }> {
  try {
    const supabase = await createClient()

    let query = supabase.from("matches").select("*")

    // Apply filtering for statistics
    if (filter?.homeTeam) {
      query = query.eq("home_team", filter.homeTeam)
    }
    if (filter?.awayTeam) {
      query = query.eq("away_team", filter.awayTeam)
    }
    if (filter?.league) {
      query = query.eq("league", filter.league)
    }

    const { data, error } = await query

    if (error) {
      return {
        data: { totalMatches: 0, bttsPercentage: 0, comebackPercentage: 0, averageGoals: 0, leagueDistribution: [] },
        error: error.message,
      }
    }

    const transformedMatches = (data || []).map(transformSupabaseMatch)

    // Apply client-side filtering
    let filtered = transformedMatches
    if (filter?.btts !== undefined) {
      filtered = filtered.filter((match) => match.btts === filter.btts)
    }
    if (filter?.comeback !== undefined) {
      filtered = filtered.filter((match) => match.comeback === filter.comeback)
    }

    const statistics = calculateStatistics(filtered)
    return { data: statistics }
  } catch (error) {
    console.error("Error calculating statistics:", error)
    return {
      data: { totalMatches: 0, bttsPercentage: 0, comebackPercentage: 0, averageGoals: 0, leagueDistribution: [] },
      error: "Failed to calculate statistics",
    }
  }
}

// Helper function to transform Supabase data to Match interface
function transformSupabaseMatch(match: any): Match {
  const ht = `${match.half_time_home_goals ?? 0}-${match.half_time_away_goals ?? 0}`
  const ft = `${match.full_time_home_goals ?? 0}-${match.full_time_away_goals ?? 0}`

  const getResult = (homeGoals: number, awayGoals: number): string => {
    if (homeGoals > awayGoals) return "H"
    if (awayGoals > homeGoals) return "A"
    return "D"
  }

  const getBTTS = (homeGoals: number, awayGoals: number): boolean => {
    return homeGoals > 0 && awayGoals > 0
  }

  const getComeback = (htHome: number, htAway: number, ftHome: number, ftAway: number): boolean => {
    const htResult = htHome > htAway ? "H" : htHome < htAway ? "A" : "D"
    const ftResult = ftHome > ftAway ? "H" : ftHome < ftAway ? "A" : "D"
    return htResult !== "D" && ftResult !== "D" && htResult !== ftResult
  }

  return {
    id: match.id.toString(),
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    homeScore: match.full_time_home_goals,
    awayScore: match.full_time_away_goals,
    date: new Date(match.created_at),
    league: match.league,
    btts: getBTTS(match.full_time_home_goals, match.full_time_away_goals),
    comeback: getComeback(
      match.half_time_home_goals ?? 0,
      match.half_time_away_goals ?? 0,
      match.full_time_home_goals,
      match.full_time_away_goals,
    ),
    metadata: {
      ht,
      ft,
      result: getResult(match.full_time_home_goals, match.full_time_away_goals),
      season: match.season,
      matchTime: match.match_time,
    },
  }
}

// Helper function to calculate statistics
function calculateStatistics(matches: Match[]): Statistics {
  const totalMatches = matches.length
  const bttsCount = matches.filter((m) => m.btts).length
  const comebackCount = matches.filter((m) => m.comeback).length
  const totalGoals = matches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)

  const leagueMap = new Map<string, number>()
  matches.forEach((match) => {
    leagueMap.set(match.league, (leagueMap.get(match.league) || 0) + 1)
  })

  return {
    totalMatches,
    bttsPercentage: totalMatches > 0 ? (bttsCount / totalMatches) * 100 : 0,
    comebackPercentage: totalMatches > 0 ? (comebackCount / totalMatches) * 100 : 0,
    averageGoals: totalMatches > 0 ? totalGoals / totalMatches : 0,
    leagueDistribution: Array.from(leagueMap.entries()).map(([league, count]) => ({
      league,
      count,
    })),
  }
}
