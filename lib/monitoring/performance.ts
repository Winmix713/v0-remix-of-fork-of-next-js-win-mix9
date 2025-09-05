interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Core Web Vitals observer
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.name,
              value: entry.startTime,
              timestamp: Date.now(),
              tags: { type: entry.entryType },
            })
          }
        })

        observer.observe({ entryTypes: ["navigation", "paint", "largest-contentful-paint"] })
        this.observers.push(observer)
      } catch (error) {
        console.warn("Failed to initialize performance observer:", error)
      }
    }

    // Web Vitals
    this.observeWebVitals()
  }

  private observeWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeLCP()

    // First Input Delay (FID)
    this.observeFID()

    // Cumulative Layout Shift (CLS)
    this.observeCLS()
  }

  private observeLCP() {
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.recordMetric({
            name: "LCP",
            value: lastEntry.startTime,
            timestamp: Date.now(),
            tags: { vital: "lcp" },
          })
        })

        observer.observe({ entryTypes: ["largest-contentful-paint"] })
        this.observers.push(observer)
      } catch (error) {
        console.warn("Failed to observe LCP:", error)
      }
    }
  }

  private observeFID() {
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: "FID",
              value: (entry as any).processingStart - entry.startTime,
              timestamp: Date.now(),
              tags: { vital: "fid" },
            })
          }
        })

        observer.observe({ entryTypes: ["first-input"] })
        this.observers.push(observer)
      } catch (error) {
        console.warn("Failed to observe FID:", error)
      }
    }
  }

  private observeCLS() {
    if ("PerformanceObserver" in window) {
      try {
        let clsValue = 0
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.recordMetric({
            name: "CLS",
            value: clsValue,
            timestamp: Date.now(),
            tags: { vital: "cls" },
          })
        })

        observer.observe({ entryTypes: ["layout-shift"] })
        this.observers.push(observer)
      } catch (error) {
        console.warn("Failed to observe CLS:", error)
      }
    }
  }

  startMeasure(name: string, tags?: Record<string, string>): void {
    if (typeof performance !== "undefined") {
      performance.mark(`${name}-start`)
    }
  }

  endMeasure(name: string, tags?: Record<string, string>): number {
    if (typeof performance !== "undefined") {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)

      const entries = performance.getEntriesByName(name, "measure")
      const duration = entries[entries.length - 1]?.duration || 0

      this.recordMetric({
        name,
        value: duration,
        timestamp: Date.now(),
        tags,
      })

      return duration
    }
    return 0
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Send to analytics if available
    this.sendToAnalytics(metric)
  }

  private sendToAnalytics(metric: PerformanceMetric): void {
    // Send to Vercel Analytics
    if (typeof window !== "undefined" && (window as any).va) {
      ;(window as any).va("track", "Performance", {
        metric: metric.name,
        value: metric.value,
        ...metric.tags,
      })
    }

    // Send to Google Analytics if available
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "performance_metric", {
        metric_name: metric.name,
        metric_value: metric.value,
        custom_parameter: metric.tags,
      })
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter((m) => m.name === name)
    }
    return [...this.metrics]
  }

  getAverageMetric(name: string): number {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return 0

    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
    this.metrics = []
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// React Hook for performance monitoring
export function usePerformanceMonitor() {
  const startMeasure = (name: string, tags?: Record<string, string>) => {
    performanceMonitor.startMeasure(name, tags)
  }

  const endMeasure = (name: string, tags?: Record<string, string>) => {
    return performanceMonitor.endMeasure(name, tags)
  }

  const recordMetric = (metric: Omit<PerformanceMetric, "timestamp">) => {
    performanceMonitor.recordMetric({ ...metric, timestamp: Date.now() })
  }

  return { startMeasure, endMeasure, recordMetric }
}
