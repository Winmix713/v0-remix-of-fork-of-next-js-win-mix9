import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tssgzrzjxslvqmpxgsss.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzc2d6cnpqeHNsdnFtcHhnc3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDQ0NzksImV4cCI6MjA3MDQyMDQ3OX0.x3dwO-gt7bp4-uM-lMktVxFdu-RaRgN8N5DM8-mqofI"

  console.log("[v0] Using Supabase credentials:", {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
  })

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
