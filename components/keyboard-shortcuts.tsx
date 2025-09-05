"use client"

import { useEffect, useState } from "react"

interface KeyboardShortcutsProps {
  onApplyFilters?: () => void
  onResetFilters?: () => void
  onExportCSV?: () => void
  onExtendedStats?: () => void
}

export function KeyboardShortcuts({
  onApplyFilters,
  onResetFilters,
  onExportCSV,
  onExtendedStats,
}: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return
      }

      // Ctrl/Cmd + key combinations
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case "enter":
            event.preventDefault()
            onApplyFilters?.()
            break
          case "r":
            event.preventDefault()
            onResetFilters?.()
            break
          case "e":
            event.preventDefault()
            onExportCSV?.()
            break
          case "s":
            event.preventDefault()
            onExtendedStats?.()
            break
        }
      }

      // Single key shortcuts
      switch (event.key) {
        case "?":
          event.preventDefault()
          setShowHelp(!showHelp)
          break
        case "Escape":
          setShowHelp(false)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onApplyFilters, onResetFilters, onExportCSV, onExtendedStats, showHelp])

  if (!showHelp) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowHelp(true)}
          className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-2 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-all duration-200"
        >
          <i data-lucide="keyboard" style={{ width: "14px", height: "14px", strokeWidth: "1.5" }}></i>
          Billentyűparancsok
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0c0f16] ring-1 ring-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Billentyűparancsok</h3>
          <button onClick={() => setShowHelp(false)} className="text-zinc-400 hover:text-zinc-200 transition-colors">
            <i data-lucide="x" style={{ width: "20px", height: "20px", strokeWidth: "1.5" }}></i>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Szűrők alkalmazása</span>
            <kbd className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-zinc-200">
              <span>Ctrl</span>
              <span>+</span>
              <span>Enter</span>
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Szűrők visszaállítása</span>
            <kbd className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-zinc-200">
              <span>Ctrl</span>
              <span>+</span>
              <span>R</span>
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">CSV export</span>
            <kbd className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-zinc-200">
              <span>Ctrl</span>
              <span>+</span>
              <span>E</span>
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Bővített statisztika</span>
            <kbd className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-zinc-200">
              <span>Ctrl</span>
              <span>+</span>
              <span>S</span>
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Súgó megjelenítése</span>
            <kbd className="inline-flex items-center rounded bg-white/10 px-2 py-1 text-xs text-zinc-200">
              <span>?</span>
            </kbd>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-zinc-400">
            Nyomj <kbd className="rounded bg-white/10 px-1 text-zinc-200">Escape</kbd> gombot a bezáráshoz
          </p>
        </div>
      </div>
    </div>
  )
}
