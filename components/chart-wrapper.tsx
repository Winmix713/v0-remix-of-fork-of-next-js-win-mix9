"use client"

import { useEffect, useRef, useState } from "react"

interface ChartWrapperProps {
  type: "bar" | "doughnut" | "line" | "pie"
  data: any
  options: any
  className?: string
  fallbackMessage?: string
}

export function ChartWrapper({
  type,
  data,
  options,
  className = "",
  fallbackMessage = "Nincs adat",
}: ChartWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const initChart = async () => {
      if (!canvasRef.current || typeof window === "undefined" || !window.Chart) {
        return
      }

      try {
        setIsLoading(true)
        setHasError(false)

        // Cleanup existing chart
        if (chartInstance.current) {
          chartInstance.current.destroy()
          chartInstance.current = null
        }

        // Create new chart
        chartInstance.current = new window.Chart(canvasRef.current, {
          type,
          data,
          options: {
            ...options,
            responsive: true,
            maintainAspectRatio: false,
          },
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Chart initialization error:", error)
        setHasError(true)
        setIsLoading(false)
      }
    }

    const timer = setTimeout(initChart, 100)

    return () => {
      clearTimeout(timer)
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [type, data, options])

  const hasData = data?.datasets?.[0]?.data?.some((value: number) => value > 0)

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />

      {(isLoading || hasError || !hasData) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02] rounded-lg">
          <div className="text-center text-zinc-400">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent mx-auto mb-2"></div>
                <p className="text-xs">Betöltés...</p>
              </>
            ) : hasError ? (
              <>
                <i
                  data-lucide="alert-triangle"
                  style={{ width: "24px", height: "24px", strokeWidth: "1.5" }}
                  className="mx-auto mb-2 text-amber-400"
                ></i>
                <p className="text-xs">Hiba a diagram betöltése során</p>
              </>
            ) : (
              <>
                <i
                  data-lucide="bar-chart"
                  style={{ width: "24px", height: "24px", strokeWidth: "1.5" }}
                  className="mx-auto mb-2"
                ></i>
                <p className="text-xs">{fallbackMessage}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
