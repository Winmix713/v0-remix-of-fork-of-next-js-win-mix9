import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
  // Modal states
  isExtendedStatsModalOpen: boolean
  isSelectionMode: boolean
  selectedMatches: Set<string>

  // Theme and preferences
  theme: "light" | "dark" | "system"
  sidebarCollapsed: boolean

  // Toast notifications
  toasts: Array<{
    id: string
    type: "success" | "error" | "info" | "warning"
    title: string
    message?: string
    duration?: number
  }>

  // Actions
  setExtendedStatsModalOpen: (open: boolean) => void
  setSelectionMode: (mode: boolean) => void
  toggleSelection: (matchId: string) => void
  selectAll: (matchIds: string[]) => void
  clearSelection: () => void
  setTheme: (theme: "light" | "dark" | "system") => void
  setSidebarCollapsed: (collapsed: boolean) => void
  addToast: (toast: Omit<UIState["toasts"][0], "id">) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      isExtendedStatsModalOpen: false,
      isSelectionMode: false,
      selectedMatches: new Set(),
      theme: "dark",
      sidebarCollapsed: false,
      toasts: [],

      // Actions
      setExtendedStatsModalOpen: (open) =>
        set((state) => ({
          isExtendedStatsModalOpen: open,
        })),

      setSelectionMode: (mode) =>
        set((state) => ({
          isSelectionMode: mode,
          selectedMatches: mode ? state.selectedMatches : new Set(),
        })),

      toggleSelection: (matchId) =>
        set((state) => {
          const newSelection = new Set(state.selectedMatches)
          if (newSelection.has(matchId)) {
            newSelection.delete(matchId)
          } else {
            newSelection.add(matchId)
          }
          return { selectedMatches: newSelection }
        }),

      selectAll: (matchIds) =>
        set((state) => {
          const currentSelection = state.selectedMatches
          const allSelected = matchIds.every((id) => currentSelection.has(id))

          if (allSelected) {
            // Deselect all
            const newSelection = new Set(currentSelection)
            matchIds.forEach((id) => newSelection.delete(id))
            return { selectedMatches: newSelection }
          } else {
            // Select all
            const newSelection = new Set(currentSelection)
            matchIds.forEach((id) => newSelection.add(id))
            return { selectedMatches: newSelection }
          }
        }),

      clearSelection: () =>
        set(() => ({
          selectedMatches: new Set(),
          isSelectionMode: false,
        })),

      setTheme: (theme) =>
        set(() => ({
          theme,
        })),

      setSidebarCollapsed: (collapsed) =>
        set(() => ({
          sidebarCollapsed: collapsed,
        })),

      addToast: (toast) =>
        set((state) => {
          const id = Math.random().toString(36).substring(2, 9)
          const newToast = {
            ...toast,
            id,
            duration: toast.duration ?? 5000,
          }
          return {
            toasts: [...state.toasts, newToast],
          }
        }),

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        })),

      clearToasts: () =>
        set(() => ({
          toasts: [],
        })),
    }),
    {
      name: "winmix-ui-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
)
