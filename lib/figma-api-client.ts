import {
  type FigmaFileResponse,
  type FigmaImagesResponse,
  type FigmaCommentsResponse,
  FigmaApiError,
  FigmaApiErrorType,
  type FigmaApiMetrics,
} from "./figma-api-types"
import { RateLimiter } from "./rate-limiter"
import { FigmaCache } from "./figma-cache"

export interface FigmaApiConfig {
  baseUrl?: string
  token?: string
  rateLimitPerMinute?: number
  cacheEnabled?: boolean
  cacheTtl?: number
  timeout?: number
}

export class FigmaApiClient {
  private baseUrl: string
  private token: string
  private rateLimiter: RateLimiter
  private cache: FigmaCache
  private cacheEnabled: boolean
  private timeout: number
  private metrics: FigmaApiMetrics

  constructor(config: FigmaApiConfig = {}) {
    this.baseUrl = config.baseUrl || "https://api.figma.com/v1"
    this.token = config.token || process.env.FIGMA_ACCESS_TOKEN || ""
    this.timeout = config.timeout || 30000
    this.cacheEnabled = config.cacheEnabled !== false

    this.rateLimiter = new RateLimiter({
      maxRequests: config.rateLimitPerMinute || 60,
      windowMs: 60 * 1000, // 1 minute
    })

    this.cache = FigmaCache.getInstance()

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      rateLimitHits: 0,
      errorsByType: {} as Record<FigmaApiErrorType, number>,
      lastUpdated: new Date(),
    }

    if (!this.token) {
      console.warn("⚠️ Figma API token not provided. Set FIGMA_ACCESS_TOKEN environment variable.")
    }
  }

  async getFile(fileKey: string, options?: { version?: string; ids?: string[] }): Promise<FigmaFileResponse> {
    const cacheKey = `file:${fileKey}:${JSON.stringify(options || {})}`

    // Check cache first
    if (this.cacheEnabled) {
      const cached = this.cache.get<FigmaFileResponse>(cacheKey)
      if (cached) {
        console.log(`📦 Cache hit for file: ${fileKey}`)
        return cached
      }
    }

    const params = new URLSearchParams()
    if (options?.version) params.append("version", options.version)
    if (options?.ids) params.append("ids", options.ids.join(","))

    const endpoint = `/files/${fileKey}${params.toString() ? `?${params}` : ""}`
    const data = await this.makeRequest<FigmaFileResponse>(endpoint)

    // Cache the result
    if (this.cacheEnabled) {
      this.cache.set(cacheKey, data, 5 * 60 * 1000) // 5 minutes
    }

    console.log(`✅ Successfully fetched file: ${data.name}`)
    return data
  }

  async getImages(
    fileKey: string,
    nodeIds: string[],
    options?: {
      format?: "jpg" | "png" | "svg" | "pdf"
      scale?: number
      version?: string
      use_absolute_bounds?: boolean
    },
  ): Promise<FigmaImagesResponse> {
    const cacheKey = `images:${fileKey}:${nodeIds.join(",")}:${JSON.stringify(options || {})}`

    if (this.cacheEnabled) {
      const cached = this.cache.get<FigmaImagesResponse>(cacheKey)
      if (cached) {
        console.log(`📦 Cache hit for images: ${nodeIds.length} nodes`)
        return cached
      }
    }

    const params = new URLSearchParams({
      ids: nodeIds.join(","),
      format: options?.format || "png",
      scale: (options?.scale || 1).toString(),
    })

    if (options?.version) params.append("version", options.version)
    if (options?.use_absolute_bounds) params.append("use_absolute_bounds", "true")

    const endpoint = `/images/${fileKey}?${params}`
    const data = await this.makeRequest<FigmaImagesResponse>(endpoint)

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, data, 10 * 60 * 1000) // 10 minutes for images
    }

    console.log(`✅ Successfully fetched ${Object.keys(data.images || {}).length} images`)
    return data
  }

  async getComments(fileKey: string): Promise<FigmaCommentsResponse> {
    const cacheKey = `comments:${fileKey}`

    if (this.cacheEnabled) {
      const cached = this.cache.get<FigmaCommentsResponse>(cacheKey)
      if (cached) {
        return cached
      }
    }

    const endpoint = `/files/${fileKey}/comments`
    const data = await this.makeRequest<FigmaCommentsResponse>(endpoint)

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, data, 2 * 60 * 1000) // 2 minutes for comments
    }

    return data
  }

  async testConnection(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const user = await this.makeRequest("/me")
      console.log(`✅ Figma API connection successful for user: ${user.email}`)
      return { success: true, user }
    } catch (error) {
      console.error(`❌ Figma API connection failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    if (!this.token) {
      throw new FigmaApiError(FigmaApiErrorType.AUTHENTICATION_ERROR, "Figma API token is required")
    }

    // Rate limiting
    await this.rateLimiter.waitIfNeeded()

    const startTime = Date.now()
    this.metrics.totalRequests++

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "X-Figma-Token": this.token,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const responseTime = Date.now() - startTime
      this.updateMetrics(responseTime, true)

      if (!response.ok) {
        await this.handleHttpError(response)
      }

      const data = await response.json()
      this.metrics.successfulRequests++

      return data
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.updateMetrics(responseTime, false)
      this.metrics.failedRequests++

      if (error instanceof FigmaApiError) {
        this.trackError(error.type)
        throw error
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          const timeoutError = new FigmaApiError(
            FigmaApiErrorType.NETWORK_ERROR,
            `Request timeout after ${this.timeout}ms`,
          )
          this.trackError(timeoutError.type)
          throw timeoutError
        }

        const networkError = new FigmaApiError(FigmaApiErrorType.NETWORK_ERROR, `Network error: ${error.message}`)
        this.trackError(networkError.type)
        throw networkError
      }

      const unknownError = new FigmaApiError(FigmaApiErrorType.UNKNOWN_ERROR, "Unknown error occurred")
      this.trackError(unknownError.type)
      throw unknownError
    }
  }

  private async handleHttpError(response: Response): Promise<never> {
    const statusCode = response.status
    let errorMessage = `HTTP ${statusCode}: ${response.statusText}`

    try {
      const errorData = await response.json()
      if (errorData.err) {
        errorMessage = errorData.err
      }
    } catch {
      // Ignore JSON parsing errors
    }

    let errorType: FigmaApiErrorType
    let retryAfter: number | undefined

    switch (statusCode) {
      case 401:
      case 403:
        errorType = FigmaApiErrorType.AUTHENTICATION_ERROR
        break
      case 404:
        errorType = FigmaApiErrorType.FILE_NOT_FOUND
        break
      case 429:
        errorType = FigmaApiErrorType.RATE_LIMIT_ERROR
        this.metrics.rateLimitHits++
        const retryAfterHeader = response.headers.get("Retry-After")
        if (retryAfterHeader) {
          retryAfter = Number.parseInt(retryAfterHeader) * 1000
        }
        break
      default:
        errorType = FigmaApiErrorType.NETWORK_ERROR
    }

    throw new FigmaApiError(errorType, errorMessage, statusCode, retryAfter)
  }

  private updateMetrics(responseTime: number, success: boolean): void {
    // Update average response time
    const totalRequests = this.metrics.totalRequests
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests

    // Update cache hit rate
    const cacheStats = this.cache.getStats()
    this.metrics.cacheHitRate = cacheStats.hitRate

    this.metrics.lastUpdated = new Date()
  }

  private trackError(errorType: FigmaApiErrorType): void {
    this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1
  }

  // Public methods for monitoring
  getMetrics(): FigmaApiMetrics {
    return { ...this.metrics }
  }

  getRateLimitStats() {
    return this.rateLimiter.getStats()
  }

  getCacheStats() {
    return this.cache.getStats()
  }

  clearCache(): void {
    this.cache.clear()
  }

  setToken(token: string): void {
    this.token = token
  }

  getToken(): string {
    return this.token ? this.token.substring(0, 8) + "..." : "Not set"
  }
}

// Singleton instance
export const figmaApiClient = new FigmaApiClient()
