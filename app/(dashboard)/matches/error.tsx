"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function MatchesError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[WinMix] Matches page error:", error)
  }, [error])

  return (
    <section className="bg-black/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-2xl font-semibold text-white">Hiba történt</h2>
            <p className="text-muted-foreground max-w-md text-pretty">
              Nem sikerült betölteni a mérkőzéseket. Kérjük, próbálja újra.
            </p>
            <Button onClick={reset} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Újrapróbálás
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
