import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { apiRateLimit } from "@/lib/rate-limit"

const AnalyticsEventSchema = z.object({
  name: z.string().min(1).max(100),
  properties: z.record(z.any()).optional(),
  timestamp: z.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1"
    const { success } = await apiRateLimit.limit(`analytics_${ip}`)

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedEvent = AnalyticsEventSchema.parse(body)

    // Log analytics event (in production, send to analytics service)
    console.log("[Analytics]", {
      event: validatedEvent.name,
      properties: validatedEvent.properties,
      timestamp: validatedEvent.timestamp || Date.now(),
      ip,
      userAgent: request.headers.get("user-agent"),
    })

    // In production, you would send this to your analytics service:
    // await sendToAnalyticsService(validatedEvent)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] POST /analytics error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid event data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
