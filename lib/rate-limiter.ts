export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export interface RateLimitStats {
  requestsInWindow: number
  maxRequests: number
  windowMs: number
  nextResetTime: Date
}

export class RateLimiter {
  private requests: number[] = []
  private config: Required<RateLimitConfig>

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    }
  }

  async waitIfNeeded(): Promise<void> {
    this.cleanOldRequests()

    if (this.requests.length >= this.config.maxRequests) {
      const oldestRequest = this.requests[0]
      const waitTime = this.config.windowMs - (Date.now() - oldestRequest)

      if (waitTime > 0) {
        console.log(`🚦 Rate limit reached. Waiting ${waitTime}ms...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        this.cleanOldRequests()
      }
    }

    this.requests.push(Date.now())
  }

  private cleanOldRequests(): void {
    const now = Date.now()
    const cutoff = now - this.config.windowMs
    this.requests = this.requests.filter((time) => time > cutoff)
  }

  getStats(): RateLimitStats {
    this.cleanOldRequests()
    return {
      requestsInWindow: this.requests.length,
      maxRequests: this.config.maxRequests,
      windowMs: this.config.windowMs,
      nextResetTime: new Date(Date.now() + this.config.windowMs),
    }
  }

  reset(): void {
    this.requests = []
  }
}
