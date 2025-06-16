export interface ErrorContext {
  userId?: string
  action: string
  metadata?: Record<string, any>
  timestamp: number
}

export interface ErrorReport {
  error: Error
  context: ErrorContext
  stackTrace?: string
}

export class ErrorHandler {
  private static errorReports: ErrorReport[] = []
  private static maxReports = 100

  /**
   * Handle an error with context
   */
  static handle(error: Error, action: string, metadata?: Record<string, any>): void {
    const context: ErrorContext = {
      action,
      metadata,
      timestamp: Date.now()
    }

    const report: ErrorReport = {
      error,
      context,
      stackTrace: error.stack
    }

    // Store error report
    this.storeError(report)

    // Log error
    this.logError(report)

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(report)
    }
  }

  /**
   * Handle async errors with automatic retry
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    action: string,
    options: {
      maxRetries?: number
      retryDelay?: number
      fallback?: () => T | Promise<T>
    } = {}
  ): Promise<T> {
    const { maxRetries = 3, retryDelay = 1000, fallback } = options
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        this.handle(lastError, `${action} (attempt ${attempt})`, {
          attempt,
          maxRetries
        })

        if (attempt === maxRetries) {
          if (fallback) {
            try {
              return await fallback()
            } catch (fallbackError) {
              this.handle(
                fallbackError instanceof Error ? fallbackError : new Error('Fallback failed'),
                `${action} (fallback)`
              )
            }
          }
          break
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1)))
      }
    }

    throw lastError || new Error('Operation failed after all retries')
  }

  /**
   * Get recent error reports
   */
  static getRecentErrors(limit = 10): ErrorReport[] {
    return this.errorReports
      .sort((a, b) => b.context.timestamp - a.context.timestamp)
      .slice(0, limit)
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): {
    totalErrors: number
    errorsByAction: Record<string, number>
    recentErrorRate: number
  } {
    const now = Date.now()
    const oneHourAgo = now - (60 * 60 * 1000)

    const recentErrors = this.errorReports.filter(
      report => report.context.timestamp > oneHourAgo
    )

    const errorsByAction: Record<string, number> = {}
    this.errorReports.forEach(report => {
      const action = report.context.action
      errorsByAction[action] = (errorsByAction[action] || 0) + 1
    })

    return {
      totalErrors: this.errorReports.length,
      errorsByAction,
      recentErrorRate: recentErrors.length
    }
  }

  /**
   * Clear old error reports
   */
  static clearOldErrors(): void {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    this.errorReports = this.errorReports.filter(
      report => report.context.timestamp > oneWeekAgo
    )
  }

  /**
   * Store error report in memory
   */
  private static storeError(report: ErrorReport): void {
    this.errorReports.push(report)
    
    // Keep only the most recent errors
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(-this.maxReports)
    }
  }

  /**
   * Log error to console with context
   */
  private static logError(report: ErrorReport): void {
    const { error, context } = report
    
    console.group(`🚨 Error in ${context.action}`)
    console.error('Message:', error.message)
    console.error('Timestamp:', new Date(context.timestamp).toISOString())
    
    if (context.metadata) {
      console.error('Metadata:', context.metadata)
    }
    
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    
    console.groupEnd()
  }

  /**
   * Send error to monitoring service
   */
  private static sendToMonitoring(report: ErrorReport): void {
    // In a real application, this would send to services like:
    // - Sentry
    // - LogRocket
    // - Datadog
    // - Custom monitoring endpoint
    
    // For now, we'll just log that it would be sent
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Would send to monitoring:', {
        action: report.context.action,
        message: report.error.message,
        timestamp: report.context.timestamp
      })
    }
  }
}

export default ErrorHandler