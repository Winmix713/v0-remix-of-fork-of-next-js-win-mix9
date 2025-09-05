declare global {
  interface Window {
    lucide: {
      createIcons: () => void
    }
    Chart: any
  }
}

export {}
