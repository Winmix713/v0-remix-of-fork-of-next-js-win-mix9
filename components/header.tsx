"use client"

import { useEffect } from "react"

interface HeaderProps {
  onSearch: () => void
  onExtendedStats: () => void
}

export function Header({ onSearch, onExtendedStats }: HeaderProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  return (
    <header className="relative z-50 sticky top-0 backdrop-blur-xl bg-[#0a0a12]/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_0_2px_rgba(255,255,255,0.06)_inset]">
              <i
                data-lucide="asterisk"
                className="text-white"
                style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}
              ></i>
            </span>
            <span className="text-lg font-semibold tracking-tight">WinMix</span>
          </a>

          <nav className="hidden md:flex gap-1 border border-white/5 rounded-full px-3 items-center">
            <a href="#" className="px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white">
              Mérkőzések
            </a>
            <a href="#stats" className="px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white">
              Statisztikák
            </a>
            <a href="#results" className="px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white">
              Eredmények
            </a>
          </nav>

          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={onExtendedStats}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-zinc-200 border border-white/10 rounded-md px-3 py-2 hover:bg-white/5"
            >
              <i data-lucide="chart-line" style={{ width: "18px", height: "18px", strokeWidth: "1.5" }}></i>
              Bővített stat.
            </button>
            <button
              type="button"
              onClick={onSearch}
              className="group relative inline-flex transition duration-300 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 text-white rounded-md p-[1px] items-center justify-center shadow-[0_8px_16px_-4px_rgba(151,65,252,0.2)] hover:shadow-[0_12px_24px_-6px_rgba(151,65,252,0.3)]"
              style={{ backgroundImage: "linear-gradient(144deg,#AF40FF, #5B42F3 50%, #00DDEB)" }}
            >
              <span className="flex items-center justify-center gap-2 text-[14px] leading-none h-full w-full transition-colors duration-300 group-hover:bg-transparent font-medium bg-[#0b0f17] rounded-md px-4 py-2">
                <i data-lucide="search" style={{ width: "20px", height: "20px", strokeWidth: "1.5" }}></i>
                <span>Keresés</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
