// Debug és monitoring eszközök

interface DebugLog {
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  category: string
  message: string
  data?: any
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
}

class DebugManager {
  private logs: DebugLog[] = []
  private metrics: PerformanceMetric[] = []
  private isDebugMode: boolean = process.env.NODE_ENV === "development"

  log(level: DebugLog["level"], category: string, message: string, data?: any) {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
    }

    this.logs.push(log)

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000)
    }

    // Console output in debug mode
    if (this.isDebugMode) {
      const emoji = {
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
        debug: "🐛",
      }

      console.log(`${emoji[level]} [${category}] ${message}`, data || "")
    }
  }

  addMetric(name: string, value: number, unit = "ms") {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
    }

    this.metrics.push(metric)

    // Keep only last 500 metrics
    if (this.metrics.length > 500) {
      this.metrics = this.metrics.slice(-500)
    }
  }

  getLogs(category?: string, level?: DebugLog["level"]): DebugLog[] {
    let filtered = this.logs

    if (category) {
      filtered = filtered.filter((log) => log.category === category)
    }

    if (level) {
      filtered = filtered.filter((log) => log.level === level)
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  getMetrics(name?: string): PerformanceMetric[] {
    let filtered = this.metrics

    if (name) {
      filtered = filtered.filter((metric) => metric.name === name)
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  exportLogs(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        logs: this.logs,
        metrics: this.metrics,
      },
      null,
      2,
    )
  }

  clearLogs() {
    this.logs = []
    this.metrics = []
  }

  // Performance monitoring helpers
  startTimer(name: string): () => void {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.addMetric(name, duration, "ms")
      this.log("debug", "performance", `${name} completed`, { duration: `${duration.toFixed(2)}ms` })
    }
  }

  // Error tracking
  trackError(error: Error, context?: string) {
    this.log("error", "error-tracking", error.message, {
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    })
  }

  // Feature usage tracking
  trackFeatureUsage(feature: string, action: string, metadata?: any) {
    this.log("info", "feature-usage", `${feature}: ${action}`, metadata)
  }

  // API call tracking
  trackAPICall(endpoint: string, method: string, duration: number, status: number) {
    this.log("info", "api-calls", `${method} ${endpoint}`, {
      duration: `${duration.toFixed(2)}ms`,
      status,
      timestamp: new Date().toISOString(),
    })

    this.addMetric(`api-${endpoint}`, duration, "ms")
  }
}

export const debugManager = new DebugManager()

// Debug hooks for React components
export function useDebugRender(componentName: string) {
  if (process.env.NODE_ENV === "development") {
    debugManager.log("debug", "component-render", `${componentName} rendered`)
  }
}

export function useDebugEffect(effectName: string, dependencies: any[]) {
  if (process.env.NODE_ENV === "development") {
    debugManager.log("debug", "component-effect", `${effectName} effect triggered`, {
      dependencies: dependencies.map((dep) => (typeof dep === "object" ? JSON.stringify(dep) : dep)),
    })
  }
}

// Performance monitoring decorator
export function withPerformanceTracking<T extends (...args: any[]) => any>(fn: T, name: string): T {
  return ((...args: any[]) => {
    const endTimer = debugManager.startTimer(name)

    try {
      const result = fn(...args)

      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(() => endTimer())
      }

      endTimer()
      return result
    } catch (error) {
      endTimer()
      debugManager.trackError(error as Error, name)
      throw error
    }
  }) as T
}

// Global error handler
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    debugManager.trackError(event.error, "global-error-handler")
  })

  window.addEventListener("unhandledrejection", (event) => {
    debugManager.trackError(new Error(event.reason), "unhandled-promise-rejection")
  })
}
