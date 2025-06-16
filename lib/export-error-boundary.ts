"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface ExportErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

interface ExportErrorBoundaryProps {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  maxRetries?: number
  fallback?: ReactNode
}

export class ExportErrorBoundary extends Component<ExportErrorBoundaryProps, ExportErrorBoundaryState> {
  private retryTimeouts: NodeJS.Timeout[] = []

  constructor(props: ExportErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ExportErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error details
    console.error("🚨 Export Error Boundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Report to error tracking service
    this.reportError(error, errorInfo)
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(clearTimeout)
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
      context: "export-operation",
    }

    // Example: Send to Sentry, LogRocket, or custom service
    console.log("📊 Export Error Report:", errorReport)
  }

  private handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3

    if (this.state.retryCount < maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }))
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default export error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export Failed</h3>
              <p className="text-gray-600 mt-1">We encountered an error while processing your export.</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
              <p className="text-sm text-red-800 font-mono">{this.state.error?.message || "Unknown error occurred"}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {this.state.retryCount < (this.props.maxRetries || 3) && (
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again ({(this.props.maxRetries || 3) - this.state.retryCount} attempts left)
                </button>
              )}

              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Start Over
              </button>
            </div>

            <div className="text-xs text-gray-500">
              <p>Error ID: {Date.now()}</p>
              <p>If this problem persists, please contact support.</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to handle export errors
export function useExportErrorHandler() {
  return (error: Error, context?: string) => {
    console.error(`🚨 Export Error in ${context || "unknown context"}:`, error)

    // Report error
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context: context || "export-hook",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    console.log("📊 Export Error Report:", errorReport)
  }
}
