interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
}

class RateLimit {
  private config: RateLimitConfig
  private store: Map<string, { count: number; resetTime: number }>

  constructor(config: RateLimitConfig) {
    this.config = config
    this.store = new Map()
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const key = `rate_limit_${identifier}`
    const record = this.store.get(key)

    // Clean up expired entries periodically
    if (this.store.size > this.config.uniqueTokenPerInterval * 2) {
      this.cleanup()
    }

    if (!record || now > record.resetTime) {
      const resetTime = now + this.config.interval
      this.store.set(key, { count: 1, resetTime })

      return {
        success: true,
        limit: this.config.uniqueTokenPerInterval,
        remaining: this.config.uniqueTokenPerInterval - 1,
        reset: new Date(resetTime),
      }
    }

    const success = record.count < this.config.uniqueTokenPerInterval

    if (success) {
      record.count++
    }

    return {
      success,
      limit: this.config.uniqueTokenPerInterval,
      remaining: Math.max(0, this.config.uniqueTokenPerInterval - record.count),
      reset: new Date(record.resetTime),
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Export configured rate limiters
export const apiRateLimit = new RateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100, // 100 requests per minute
})

export const strictRateLimit = new RateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10, // 10 requests per minute
})

export const authRateLimit = new RateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 5, // 5 attempts per 15 minutes
})
