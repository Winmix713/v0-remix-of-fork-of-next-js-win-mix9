"use client"

import { useEffect } from "react"

export function Footer() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  return (
    <footer className="relative z-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <i
                data-lucide="asterisk"
                className="text-white"
                style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}
              ></i>
            </span>
            <span className="text-sm font-medium text-zinc-300">© 2025 winmix.hu</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <a href="#" className="hover:text-zinc-200">
              Adatvédelem
            </a>
            <a href="#" className="hover:text-zinc-200">
              Felhasználási feltételek
            </a>
            <a href="#" className="hover:text-zinc-200">
              Kapcsolat
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
