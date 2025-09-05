"use client"

interface LoadingOverlayProps {
  isVisible: boolean
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-xl ring-1 ring-white/10 bg-[#0c0f16] px-6 py-4 flex items-center gap-3">
        <span className="inline-flex h-6 w-6 rounded-full border-2 border-white/20 border-t-violet-400 animate-spin"></span>
        <span className="text-sm text-zinc-200">Adatok betöltése...</span>
      </div>
    </div>
  )
}
