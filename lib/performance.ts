// Caching utilities
class Cache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>()

  set(key: string, data: T, ttlMs = 300000): void {
    // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Global caches
export const figmaFileCache = new Cache<any>()
export const imageCache = new Cache<string>()
export const analysisCache = new Cache<any>()

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static startTimer(operation: string): () => void {
    const start = performance.now()

    return () => {
      const duration = performance.now() - start
      const existing = this.metrics.get(operation) || []
      existing.push(duration)

      // Keep only last 100 measurements
      if (existing.length > 100) {
        existing.shift()
      }

      this.metrics.set(operation, existing)

      console.log(`⏱️ ${operation}: ${duration.toFixed(2)}ms`)
    }
  }

  static getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || []
    if (times.length === 0) return 0

    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  static getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {}

    for (const [operation, times] of this.metrics.entries()) {
      result[operation] = {
        average: this.getAverageTime(operation),
        count: times.length,
      }
    }

    return result
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Image optimization
export function optimizeImageUrl(
  url: string,
  options?: {
    width?: number
    height?: number
    quality?: number
    format?: "webp" | "png" | "jpg"
  },
): string {
  if (!options) return url

  const params = new URLSearchParams()
  if (options.width) params.append("w", options.width.toString())
  if (options.height) params.append("h", options.height.toString())
  if (options.quality) params.append("q", options.quality.toString())
  if (options.format) params.append("f", options.format)

  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}${params.toString()}`
}

// Bundle size monitoring
export function logBundleSize(componentName: string, size: number): void {
  console.log(`📦 ${componentName} bundle size: ${(size / 1024).toFixed(2)}KB`)

  if (size > 100000) {
    // 100KB
    console.warn(`⚠️ Large bundle detected for ${componentName}`)
  }
}
