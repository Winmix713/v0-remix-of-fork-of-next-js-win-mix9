import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"

const handlers = [
  // Mock API routes
  http.get("/api/matches", () => {
    return HttpResponse.json({
      data: [
        {
          id: "1",
          home_team: "Arsenal",
          away_team: "Chelsea",
          full_time_home_goals: 2,
          full_time_away_goals: 1,
          league: "Premier League",
          created_at: "2024-01-15T15:00:00Z",
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    })
  }),

  http.post("/api/matches", () => {
    return HttpResponse.json(
      {
        data: {
          id: "2",
          home_team: "Liverpool",
          away_team: "Manchester City",
          full_time_home_goals: 1,
          full_time_away_goals: 2,
          league: "Premier League",
          created_at: "2024-01-16T15:00:00Z",
        },
      },
      { status: 201 },
    )
  }),

  // Mock Supabase endpoints
  http.post("https://tssgzrzjxslvqmpxgsss.supabase.co/rest/v1/*", () => {
    return HttpResponse.json({ data: [], error: null })
  }),
]

export const server = setupServer(...handlers)
