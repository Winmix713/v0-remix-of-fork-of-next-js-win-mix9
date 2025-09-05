"use client"

import { useEffect } from "react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalCount: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  position: "top" | "bottom"
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  position,
}: PaginationControlsProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  const showPagination = totalCount > 0

  if (!showPagination) {
    return null
  }

  return (
    <div
      id={`pagination${position === "top" ? "Top" : "Bottom"}`}
      className="flex items-center justify-between bg-white/5 ring-1 ring-white/10 rounded-lg px-4 py-3"
    >
      {position === "top" ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400">Mérkőzések oldalanként:</span>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-white/10 ring-1 ring-white/20 rounded-md px-2 py-1 text-sm text-zinc-200 border-none focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span>
            Összesen:{" "}
            <span id="totalItems" className="font-medium text-zinc-200">
              {totalCount}
            </span>{" "}
            mérkőzés
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          id={`prevPage${position === "top" ? "Top" : "Bottom"}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-200 border border-white/10 rounded-md hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 pagination-btn"
        >
          <i data-lucide="chevron-left" style={{ width: "16px", height: "16px" }}></i>
          Előző
        </button>
        <span
          id={`pageInfo${position === "top" ? "Top" : "Bottom"}`}
          className="px-3 py-1.5 text-sm text-zinc-300 bg-white/10 rounded-md"
        >
          {currentPage} / {totalPages}
        </span>
        <button
          id={`nextPage${position === "top" ? "Top" : "Bottom"}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-200 border border-white/10 rounded-md hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 pagination-btn"
        >
          Következő
          <i data-lucide="chevron-right" style={{ width: "16px", height: "16px" }}></i>
        </button>
      </div>
    </div>
  )
}
