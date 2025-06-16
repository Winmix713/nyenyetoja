import { figmaApiClient } from "@/lib/figma-api-client"
import type { HealthStatus, RateLimitStats, CacheStats } from "@/lib/figma-api-types"

export interface HealthReport {
  overall: HealthStatus
  api: HealthStatus
  rateLimit: RateLimitStats & { status: "healthy" | "warning" | "critical" }
  cache: CacheStats & { status: "healthy" | "warning" | "critical" }
  timestamp: Date
}

export class FigmaHealthCheck {
  static async checkApiHealth(): Promise<HealthStatus> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      const result = await figmaApiClient.testConnection()
      const responseTime = Date.now() - startTime

      if (!result.success) {
        errors.push(result.error || "Connection test failed")
        return {
          status: "unhealthy",
          responseTime,
          lastCheck: new Date(),
          errors,
        }
      }

      const status = responseTime > 5000 ? "degraded" : "healthy"

      return {
        status,
        responseTime,
        lastCheck: new Date(),
        errors,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      errors.push(error instanceof Error ? error.message : "Unknown error")

      return {
        status: "unhealthy",
        responseTime,
        lastCheck: new Date(),
        errors,
      }
    }
  }

  static async checkRateLimit(): Promise<RateLimitStats & { status: "healthy" | "warning" | "critical" }> {
    const stats = figmaApiClient.getRateLimitStats()
    const utilizationRate = stats.requestsInWindow / stats.maxRequests

    let status: "healthy" | "warning" | "critical"
    if (utilizationRate < 0.7) {
      status = "healthy"
    } else if (utilizationRate < 0.9) {
      status = "warning"
    } else {
      status = "critical"
    }

    return { ...stats, status }
  }

  static async checkCacheHealth(): Promise<CacheStats & { status: "healthy" | "warning" | "critical" }> {
    const stats = figmaApiClient.getCacheStats()

    let status: "healthy" | "warning" | "critical"
    if (stats.hitRate > 0.8) {
      status = "healthy"
    } else if (stats.hitRate > 0.5) {
      status = "warning"
    } else {
      status = "critical"
    }

    return { ...stats, status }
  }

  static async generateHealthReport(): Promise<HealthReport> {
    const [apiHealth, rateLimitHealth, cacheHealth] = await Promise.all([
      this.checkApiHealth(),
      this.checkRateLimit(),
      this.checkCacheHealth(),
    ])

    // Determine overall health
    let overallStatus: "healthy" | "degraded" | "unhealthy"
    if (apiHealth.status === "unhealthy" || rateLimitHealth.status === "critical") {
      overallStatus = "unhealthy"
    } else if (
      apiHealth.status === "degraded" ||
      rateLimitHealth.status === "warning" ||
      cacheHealth.status === "warning"
    ) {
      overallStatus = "degraded"
    } else {
      overallStatus = "healthy"
    }

    return {
      overall: {
        status: overallStatus,
        responseTime: apiHealth.responseTime,
        lastCheck: new Date(),
        errors: apiHealth.errors,
      },
      api: apiHealth,
      rateLimit: rateLimitHealth,
      cache: cacheHealth,
      timestamp: new Date(),
    }
  }
}
