interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

interface ExportPerformanceData {
  totalDuration: number
  metrics: PerformanceMetric[]
  memoryUsage?: {
    used: number
    total: number
    peak: number
  }
  fileStats?: {
    totalFiles: number
    totalSize: number
    compressionRatio?: number
  }
}

class ExportPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private memorySnapshots: number[] = []

  startTimer(name: string, metadata?: Record<string, any>): () => void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    }

    this.metrics.set(name, metric)

    // Take memory snapshot
    if (typeof window !== "undefined" && "memory" in performance) {
      this.memorySnapshots.push((performance as any).memory.usedJSHeapSize)
    }

    // Return end timer function
    return () => this.endTimer(name)
  }

  endTimer(name: string): number {
    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`⚠️ Timer "${name}" not found`)
      return 0
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration

    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)

    return duration
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  getPerformanceData(): ExportPerformanceData {
    const metrics = this.getMetrics()
    const totalDuration = metrics.reduce((sum, metric) => sum + (metric.duration || 0), 0)

    const performanceData: ExportPerformanceData = {
      totalDuration,
      metrics,
    }

    // Add memory usage if available
    if (typeof window !== "undefined" && "memory" in performance) {
      const memory = (performance as any).memory
      performanceData.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        peak: Math.max(...this.memorySnapshots),
      }
    }

    return performanceData
  }

  reset(): void {
    this.metrics.clear()
    this.memorySnapshots = []
  }

  // Performance optimization helpers
  static async optimizeForLargeExports<T>(
    operation: () => Promise<T>,
    options: {
      chunkSize?: number
      delayBetweenChunks?: number
      maxConcurrency?: number
    } = {},
  ): Promise<T> {
    const { delayBetweenChunks = 10 } = options

    // Add small delay to prevent blocking the main thread
    if (delayBetweenChunks > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenChunks))
    }

    return operation()
  }

  static measureMemoryUsage(): number {
    if (typeof window !== "undefined" && "memory" in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  static async processInBatches<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize = 10,
    delayBetweenBatches = 100,
  ): Promise<R[]> {
    const results: R[] = []

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch.map(processor))
      results.push(...batchResults)

      // Add delay between batches to prevent overwhelming the system
      if (i + batchSize < items.length && delayBetweenBatches > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches))
      }
    }

    return results
  }

  // Export-specific performance optimizations
  static optimizeZipGeneration(zip: any): void {
    // Configure JSZip for better performance
    zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6, // Balance between speed and compression
      },
      streamFiles: true, // Enable streaming for large files
    })
  }

  static async optimizeFileGeneration(
    files: Record<string, string>,
    maxConcurrency = 5,
  ): Promise<Record<string, string>> {
    const fileEntries = Object.entries(files)
    const results: Record<string, string> = {}

    // Process files in batches to avoid memory issues
    for (let i = 0; i < fileEntries.length; i += maxConcurrency) {
      const batch = fileEntries.slice(i, i + maxConcurrency)

      const batchResults = await Promise.all(
        batch.map(async ([path, content]) => {
          // Simulate file processing optimization
          await new Promise((resolve) => setTimeout(resolve, 1))
          return [path, content] as const
        }),
      )

      batchResults.forEach(([path, content]) => {
        results[path] = content
      })
    }

    return results
  }
}

export const exportPerformanceMonitor = new ExportPerformanceMonitor()

// Performance monitoring decorator
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(fn: T, name: string): T {
  return (async (...args: any[]) => {
    const endTimer = exportPerformanceMonitor.startTimer(name, {
      args: args.length,
      timestamp: new Date().toISOString(),
    })

    try {
      const result = await fn(...args)
      endTimer()
      return result
    } catch (error) {
      endTimer()
      throw error
    }
  }) as T
}

// Performance metrics collection
export function collectExportMetrics(performanceData: ExportPerformanceData): void {
  // Log performance metrics
  console.group("📊 Export Performance Metrics")
  console.log(`Total Duration: ${performanceData.totalDuration.toFixed(2)}ms`)

  if (performanceData.memoryUsage) {
    console.log(`Memory Usage: ${(performanceData.memoryUsage.used / 1024 / 1024).toFixed(2)}MB`)
    console.log(`Peak Memory: ${(performanceData.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB`)
  }

  if (performanceData.fileStats) {
    console.log(`Files Generated: ${performanceData.fileStats.totalFiles}`)
    console.log(`Total Size: ${(performanceData.fileStats.totalSize / 1024).toFixed(2)}KB`)
  }

  console.log("Detailed Metrics:")
  performanceData.metrics.forEach((metric) => {
    if (metric.duration) {
      console.log(`  ${metric.name}: ${metric.duration.toFixed(2)}ms`)
    }
  })
  console.groupEnd()

  // Send metrics to analytics service (in production)
  if (process.env.NODE_ENV === "production") {
    // Example: Send to analytics service
    // analytics.track("export_performance", performanceData)
  }
}
