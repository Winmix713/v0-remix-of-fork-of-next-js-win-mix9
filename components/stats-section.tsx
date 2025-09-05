"use client"

import { useEffect, useRef, useCallback } from "react"

interface StatsSectionProps {
  stats: {
    total: number
    home: number
    draw: number
    away: number
    bttsYes: number
    bttsNo: number
  }
  matches: any[]
  onExtendedStats: () => void
}

declare global {
  interface Window {
    Chart: any
    lucide: any
  }
}

export function StatsSection({ stats, matches, onExtendedStats }: StatsSectionProps) {
  const chartResultsRef = useRef<HTMLCanvasElement>(null)
  const chartBTTSRef = useRef<HTMLCanvasElement>(null)
  const chartResultsInstance = useRef<any>(null)
  const chartBTTSInstance = useRef<any>(null)
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  const cleanupCharts = useCallback(() => {
    if (chartResultsInstance.current) {
      try {
        chartResultsInstance.current.destroy()
        chartResultsInstance.current = null
      } catch (error) {
        console.warn("Error destroying results chart:", error)
      }
    }
    if (chartBTTSInstance.current) {
      try {
        chartBTTSInstance.current.destroy()
        chartBTTSInstance.current = null
      } catch (error) {
        console.warn("Error destroying BTTS chart:", error)
      }
    }
  }, [])

  const initializeCharts = useCallback(() => {
    if (typeof window === "undefined" || !window.Chart || !chartResultsRef.current || !chartBTTSRef.current) {
      console.log("[v0] Chart.js not ready, retrying...")
      return false
    }

    try {
      // Cleanup existing charts
      cleanupCharts()

      chartResultsInstance.current = new window.Chart(chartResultsRef.current, {
        type: "bar",
        data: {
          labels: ["Hazai", "Döntetlen", "Vendég"],
          datasets: [
            {
              label: "Mérkőzések száma",
              data: [stats.home, stats.draw, stats.away],
              backgroundColor: ["#34d39955", "#fbbf2455", "#60a5fa55"],
              borderColor: ["#34d399", "#fbbf24", "#60a5fa"],
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
              hoverBackgroundColor: ["#34d399aa", "#fbbf24aa", "#60a5faaa"],
              hoverBorderColor: ["#22c55e", "#f59e0b", "#3b82f6"],
              hoverBorderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(12, 15, 22, 0.95)",
              titleColor: "#ffffff",
              bodyColor: "#ffffff",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
              cornerRadius: 12,
              displayColors: false,
              titleFont: { size: 14, weight: "600" },
              bodyFont: { size: 13 },
              padding: 12,
              callbacks: {
                title: (context: any) => `${context[0].label} győzelem`,
                label: (context: any) => {
                  const total = stats.total
                  const percentage = total > 0 ? Math.round((context.parsed.y / total) * 100) : 0
                  return `${context.parsed.y} mérkőzés (${percentage}%)`
                },
              },
            },
          },
          scales: {
            x: {
              grid: {
                color: "rgba(255,255,255,0.08)",
                drawBorder: false,
              },
              ticks: {
                color: "rgba(228,228,231,0.9)",
                font: { size: 12, weight: "500" },
                padding: 10,
              },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(255,255,255,0.08)",
                drawBorder: false,
              },
              ticks: {
                color: "rgba(228,228,231,0.9)",
                stepSize: Math.max(1, Math.ceil(Math.max(stats.home, stats.draw, stats.away) / 10)),
                padding: 10,
                font: { size: 11 },
              },
              border: { display: false },
            },
          },
          animation: {
            duration: 1200,
            easing: "easeOutQuart",
          },
          interaction: {
            intersect: false,
            mode: "index",
          },
          onHover: (event: any, elements: any) => {
            if (chartResultsRef.current) {
              chartResultsRef.current.style.cursor = elements.length > 0 ? "pointer" : "default"
            }
          },
        },
      })

      chartBTTSInstance.current = new window.Chart(chartBTTSRef.current, {
        type: "doughnut",
        data: {
          labels: ["Igen", "Nem"],
          datasets: [
            {
              data: [stats.bttsYes, stats.bttsNo],
              backgroundColor: ["#a78bfa", "#ffffff33"],
              borderColor: ["#8b5cf6", "#ffffff55"],
              borderWidth: 2,
              hoverBackgroundColor: ["#9333ea", "#ffffff44"],
              hoverBorderColor: ["#7c3aed", "#ffffff66"],
              hoverBorderWidth: 3,
              spacing: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "rgba(228,228,231,0.9)",
                boxWidth: 14,
                boxHeight: 14,
                padding: 20,
                font: { size: 13, weight: "500" },
                usePointStyle: true,
                pointStyle: "circle",
              },
              position: "bottom",
            },
            tooltip: {
              backgroundColor: "rgba(12, 15, 22, 0.95)",
              titleColor: "#ffffff",
              bodyColor: "#ffffff",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
              cornerRadius: 12,
              displayColors: true,
              titleFont: { size: 14, weight: "600" },
              bodyFont: { size: 13 },
              padding: 12,
              callbacks: {
                title: (context: any) => "BTTS Statisztika",
                label: (context: any) => {
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                  const percentage = total > 0 ? Math.round((context.parsed / total) * 100) : 0
                  return `${context.label}: ${context.parsed} mérkőzés (${percentage}%)`
                },
              },
            },
          },
          cutout: "65%",
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1200,
            easing: "easeOutQuart",
          },
          interaction: {
            intersect: false,
          },
          onHover: (event: any, elements: any) => {
            if (chartBTTSRef.current) {
              chartBTTSRef.current.style.cursor = elements.length > 0 ? "pointer" : "default"
            }
          },
        },
      })

      console.log("[v0] Charts initialized successfully")
      return true
    } catch (error) {
      console.error("[v0] Error initializing charts:", error)
      return false
    }
  }, [stats, cleanupCharts])

  useEffect(() => {
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current)
    }

    const attemptInitialization = (retryCount = 0) => {
      const maxRetries = 5
      const success = initializeCharts()

      if (!success && retryCount < maxRetries) {
        console.log(`[v0] Chart initialization attempt ${retryCount + 1} failed, retrying...`)
        initTimeoutRef.current = setTimeout(
          () => {
            attemptInitialization(retryCount + 1)
          },
          200 * (retryCount + 1),
        ) // Exponential backoff
      }
    }

    // Initial delay to ensure Chart.js is loaded
    initTimeoutRef.current = setTimeout(() => {
      attemptInitialization()
    }, 100)

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
      cleanupCharts()
    }
  }, [stats, matches, initializeCharts, cleanupCharts])

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0
  }

  return (
    <section id="stats" className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Statisztikák</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onExtendedStats}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-200 border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors duration-200"
          >
            <i data-lucide="chart-line" style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}></i>
            Bővített statisztika
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <i data-lucide="info" style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}></i>
            <span>Szűrt eredmények alapján</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stats-grid">
        <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 px-4 py-4 stats-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Összes mérkőzés</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
              <i
                data-lucide="list"
                className="text-zinc-200"
                style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}
              ></i>
            </span>
          </div>
          <p id="statTotal" className="mt-2 text-2xl font-semibold tracking-tight">
            {stats.total}
          </p>
        </div>
        <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 px-4 py-4 stats-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Hazai győzelem</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-400/10 ring-1 ring-emerald-400/30">
              <i
                data-lucide="circle-dot"
                className="text-emerald-300"
                style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}
              ></i>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p id="statHome" className="text-2xl font-semibold tracking-tight">
              {stats.home}
            </p>
            <span className="text-xs text-emerald-400">({getPercentage(stats.home, stats.total)}%)</span>
          </div>
        </div>
        <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 px-4 py-4 stats-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Döntetlen</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/15 to-amber-400/10 ring-1 ring-amber-400/30">
              <i
                data-lucide="minus"
                className="text-amber-300"
                style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}
              ></i>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p id="statDraw" className="text-2xl font-semibold tracking-tight">
              {stats.draw}
            </p>
            <span className="text-xs text-amber-400">({getPercentage(stats.draw, stats.total)}%)</span>
          </div>
        </div>
        <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 px-4 py-4 stats-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Vendég győzelem</span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500/15 to-sky-400/10 ring-1 ring-sky-400/30">
              <i
                data-lucide="circle"
                className="text-sky-300"
                style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}
              ></i>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p id="statAway" className="text-2xl font-semibold tracking-tight">
              {stats.away}
            </p>
            <span className="text-xs text-sky-400">({getPercentage(stats.away, stats.total)}%)</span>
          </div>
        </div>
      </div>

      {/* Detailed statistics */}
      <div className="mt-6 ring-1 ring-white/10 bg-white/5 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight text-white">Részletes statisztika</h3>
          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <i data-lucide="chart-no-axes-column" style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}></i>
            <span>Megoszlások</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-300 mb-2 flex items-center gap-2">
              <i data-lucide="bar-chart-3" style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}></i>
              Eredmény megoszlás (H/D/V)
            </p>
            <div className="rounded-lg bg-white/[0.03] ring-1 ring-white/10 p-3">
              <div className="relative h-56 chart-container">
                <canvas id="chartResults" ref={chartResultsRef}></canvas>
                {stats.total === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-zinc-400">
                      <i
                        data-lucide="bar-chart"
                        style={{ width: "24px", height: "24px", strokeWidth: "1.5" }}
                        className="mx-auto mb-2"
                      ></i>
                      <p className="text-xs">Nincs adat</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-300 mb-2 flex items-center gap-2">
              <i data-lucide="pie-chart" style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}></i>
              BTTS (Mindkét csapat gólt szerzett)
            </p>
            <div className="rounded-lg bg-white/[0.03] ring-1 ring-white/10 p-3">
              <div className="relative h-56 chart-container">
                <canvas id="chartBTTS" ref={chartBTTSRef}></canvas>
                {stats.total === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-zinc-400">
                      <i
                        data-lucide="pie-chart"
                        style={{ width: "24px", height: "24px", strokeWidth: "1.5" }}
                        className="mx-auto mb-2"
                      ></i>
                      <p className="text-xs">Nincs adat</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
