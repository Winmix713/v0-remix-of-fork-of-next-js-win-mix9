interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: number
}

interface UserProperties {
  userId?: string
  sessionId: string
  userAgent: string
  viewport: { width: number; height: number }
  timezone: string
  language: string
}

class Analytics {
  private static instance: Analytics
  private sessionId: string
  private userId?: string
  private queue: AnalyticsEvent[] = []
  private isInitialized = false

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  constructor() {
    this.sessionId = this.generateSessionId()
    if (typeof window !== "undefined") {
      this.initialize()
    }
  }

  private initialize() {
    // Initialize Vercel Analytics
    if (typeof window !== "undefined" && (window as any).va) {
      this.isInitialized = true
      this.flushQueue()
    }

    // Track page views
    this.trackPageView()

    // Track user engagement
    this.trackEngagement()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  private getUserProperties(): UserProperties {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    }
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  track(event: AnalyticsEvent) {
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      properties: {
        ...event.properties,
        ...this.getUserProperties(),
      },
    }

    if (this.isInitialized) {
      this.sendEvent(enrichedEvent)
    } else {
      this.queue.push(enrichedEvent)
    }
  }

  private sendEvent(event: AnalyticsEvent) {
    // Send to Vercel Analytics
    if (typeof window !== "undefined" && (window as any).va) {
      ;(window as any).va("track", event.name, event.properties)
    }

    // Send to Google Analytics if available
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", event.name, event.properties)
    }

    // Send to custom analytics endpoint
    this.sendToCustomEndpoint(event)
  }

  private async sendToCustomEndpoint(event: AnalyticsEvent) {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.warn("Failed to send analytics event:", error)
    }
  }

  private flushQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift()
      if (event) {
        this.sendEvent(event)
      }
    }
  }

  private trackPageView() {
    this.track({
      name: "page_view",
      properties: {
        path: window.location.pathname,
        referrer: document.referrer,
        title: document.title,
      },
    })
  }

  private trackEngagement() {
    let startTime = Date.now()
    let isActive = true

    // Track time on page
    const trackTimeOnPage = () => {
      if (isActive) {
        const timeSpent = Date.now() - startTime
        this.track({
          name: "time_on_page",
          properties: {
            duration: timeSpent,
            path: window.location.pathname,
          },
        })
      }
    }

    // Track when user becomes inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActive = false
        trackTimeOnPage()
      } else {
        isActive = true
        startTime = Date.now()
      }
    }

    // Track before page unload
    const handleBeforeUnload = () => {
      trackTimeOnPage()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Track scroll depth
    let maxScrollDepth = 0
    const trackScrollDepth = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100,
      )
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        this.track({
          name: "scroll_depth",
          properties: {
            depth: scrollDepth,
            path: window.location.pathname,
          },
        })
      }
    }

    window.addEventListener("scroll", trackScrollDepth, { passive: true })
  }

  // Predefined event tracking methods
  trackMatchFilter(filters: Record<string, any>) {
    this.track({
      name: "match_filter_applied",
      properties: {
        filters,
        filterCount: Object.keys(filters).filter((key) => filters[key]).length,
      },
    })
  }

  trackMatchExport(format: string, count: number) {
    this.track({
      name: "match_export",
      properties: {
        format,
        matchCount: count,
      },
    })
  }

  trackError(error: Error, context?: string) {
    this.track({
      name: "error_occurred",
      properties: {
        error: error.message,
        stack: error.stack,
        context,
      },
    })
  }

  trackPerformance(metric: string, value: number) {
    this.track({
      name: "performance_metric",
      properties: {
        metric,
        value,
      },
    })
  }
}

export const analytics = Analytics.getInstance()

// React Hook for analytics
export function useAnalytics() {
  const trackEvent = (name: string, properties?: Record<string, any>) => {
    analytics.track({ name, properties })
  }

  const trackMatchFilter = (filters: Record<string, any>) => {
    analytics.trackMatchFilter(filters)
  }

  const trackMatchExport = (format: string, count: number) => {
    analytics.trackMatchExport(format, count)
  }

  const trackError = (error: Error, context?: string) => {
    analytics.trackError(error, context)
  }

  const setUserId = (userId: string) => {
    analytics.setUserId(userId)
  }

  return {
    trackEvent,
    trackMatchFilter,
    trackMatchExport,
    trackError,
    setUserId,
  }
}
