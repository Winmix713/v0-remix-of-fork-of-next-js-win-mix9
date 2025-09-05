"use client"

import { useMatches } from "@/lib/hooks/use-matches"
import { useUIStore } from "@/lib/stores/ui-store"
import { FilterSection } from "@/components/features/filter-section"
import { StatsSection } from "@/components/features/stats-section"
import { ResultsSection } from "@/components/features/results-section"
import { ExtendedStatsModal } from "@/components/extended-stats-modal"
import { ToastContainer } from "@/components/toast-container"

export function MatchesPage() {
  const {
    matches,
    currentFilter,
    currentPage,
    itemsPerPage,
    sortConfig,
    totalCount,
    isLoading,
    statistics,
    setFilter,
    setItemsPerPage,
    applyFilters,
    resetFilters,
    handlePageChange,
    handleSort,
    exportToCSV,
  } = useMatches()

  const { isExtendedStatsModalOpen, setExtendedStatsModalOpen } = useUIStore()

  return (
    <>
      <FilterSection
        filters={currentFilter}
        onFiltersChange={setFilter}
        onApply={applyFilters}
        onReset={resetFilters}
        onExport={exportToCSV}
        isLoading={isLoading}
      />

      <StatsSection statistics={statistics} matches={matches} onExtendedStats={() => setExtendedStatsModalOpen(true)} />

      <ResultsSection
        matches={matches}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        sortConfig={sortConfig}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onItemsPerPageChange={setItemsPerPage}
        onSort={handleSort}
      />

      <ExtendedStatsModal
        isOpen={isExtendedStatsModalOpen}
        onClose={() => setExtendedStatsModalOpen(false)}
        matches={matches}
        filters={currentFilter}
      />

      <ToastContainer />
    </>
  )
}
