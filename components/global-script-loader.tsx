"use client"

import { useEffect } from "react"

export function GlobalScriptLoader() {
  useEffect(() => {
    // Ensure global libraries are available
    const checkLibraries = () => {
      if (typeof window !== "undefined") {
        // Initialize Lucide icons
        if (window.lucide) {
          window.lucide.createIcons()
        }

        // Log Chart.js availability
        if (window.Chart) {
          console.log("[v0] Chart.js loaded successfully")
        }

        // Log Supabase availability
        if (window.supabase) {
          console.log("[v0] Supabase client loaded successfully")
        }
      }
    }

    // Check immediately and after a short delay
    checkLibraries()
    const timer = setTimeout(checkLibraries, 1000)

    return () => clearTimeout(timer)
  }, [])

  return null
}
