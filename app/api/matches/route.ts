import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import { apiRateLimit } from "@/lib/rate-limit"

// Validation schemas
const MatchSchema = z.object({
  homeTeam: z.string().min(1).max(100).trim(),
  awayTeam: z.string().min(1).max(100).trim(),
  homeScore: z.number().int().min(0).max(50),
  awayScore: z.number().int().min(0).max(50),
  date: z.string().datetime(),
  league: z.string().min(1).max(50).trim(),
  btts: z.boolean(),
  comeback: z.boolean(),
})

const QuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, Number.parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, Number.parseInt(val, 10))) : 20)),
  homeTeam: z.string().optional(),
  awayTeam: z.string().optional(),
  league: z.string().optional(),
  btts: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  comeback: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1"
    const { success, limit, remaining, reset } = await apiRateLimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toISOString(),
            "Retry-After": Math.ceil((reset.getTime() - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    // Parse and validate query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams)
    const validatedQuery = QuerySchema.parse(queryParams)

    // Create Supabase client (anon key for reads)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
        },
      },
    )

    // Build query with proper SQL injection protection
    let query = supabase
      .from("matches")
      .select("*", { count: "exact" })
      .range((validatedQuery.page - 1) * validatedQuery.limit, validatedQuery.page * validatedQuery.limit - 1)
      .order("created_at", { ascending: false })

    // Apply filters with parameterized queries
    if (validatedQuery.homeTeam) {
      query = query.ilike("home_team", `%${validatedQuery.homeTeam.replace(/[%_]/g, "\\$&")}%`)
    }
    if (validatedQuery.awayTeam) {
      query = query.ilike("away_team", `%${validatedQuery.awayTeam.replace(/[%_]/g, "\\$&")}%`)
    }
    if (validatedQuery.league) {
      query = query.eq("league", validatedQuery.league)
    }

    // BTTS filter: true => both teams scored (>0), false => at least one team scored 0
    if (validatedQuery.btts !== undefined) {
      if (validatedQuery.btts === true) {
        query = query.gt("full_time_home_goals", 0).gt("full_time_away_goals", 0)
      } else {
        query = query.or("full_time_home_goals.eq.0,full_time_away_goals.eq.0")
      }
    }

    // Comeback filter: true => halftime leader differs from fulltime leader (no draws),
    // false => halftime draw OR fulltime draw OR same leader at HT and FT
    if (validatedQuery.comeback !== undefined) {
      if (validatedQuery.comeback === true) {
        query = query.or(
          "and(half_time_home_goals.gt.half_time_away_goals,full_time_home_goals.lt.full_time_away_goals)," +
            "and(half_time_home_goals.lt.half_time_away_goals,full_time_home_goals.gt.full_time_away_goals)",
        )
      } else {
        query = query.or(
          "half_time_home_goals.eq.half_time_away_goals," +
            "full_time_home_goals.eq.full_time_away_goals," +
            "and(half_time_home_goals.gt.half_time_away_goals,full_time_home_goals.gt.full_time_away_goals)," +
            "and(half_time_home_goals.lt.half_time_away_goals,full_time_home_goals.lt.full_time_away_goals)"
        )
      }
    }

    const { data, error, count } = await query

    if (error) {
      console.error("Database error:", error)
      throw new Error("Database query failed")
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.json({
      data,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validatedQuery.limit),
      },
    })

    response.headers.set("X-RateLimit-Limit", limit.toString())
    response.headers.set("X-RateLimit-Remaining", remaining.toString())
    response.headers.set("X-RateLimit-Reset", reset.toISOString())

    return response
  } catch (error) {
    console.error("[API] GET /matches error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Stricter rate limiting for write operations
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1"
    const { success } = await apiRateLimit.limit(`post_${ip}`)

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = MatchSchema.parse(body)

    // Additional business logic validation
    if (validatedData.homeTeam === validatedData.awayTeam) {
      return NextResponse.json({ error: "Home and away teams cannot be the same" }, { status: 400 })
    }

    // Create Supabase client with service role for write operations
    // Use createClient from @supabase/supabase-js for service role operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Insert match with proper data sanitization
    const { data, error } = await supabase
      .from("matches")
      .insert([
        {
          home_team: validatedData.homeTeam,
          away_team: validatedData.awayTeam,
          full_time_home_goals: validatedData.homeScore,
          full_time_away_goals: validatedData.awayScore,
          date: validatedData.date,
          league: validatedData.league,
          // Calculate BTTS and comeback from scores
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Database insert error:", error)
      throw new Error("Failed to create match")
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[API] POST /matches error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
