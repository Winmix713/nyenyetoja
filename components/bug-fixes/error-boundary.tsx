"use client"

import type React from "react"
import { Component, type ErrorInfo, type ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, RefreshCw, Bug, Copy, ExternalLink } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to monitoring service
    this.logError(error, errorInfo)

    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry, LogRocket, etc.
      console.error("Error logged:", errorData)
    } else {
      console.error("Development Error:", errorData)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private copyErrorDetails = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    }

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
  }

  private reportIssue = () => {
    const issueUrl = `https://github.com/your-org/figma-react-converter/issues/new?title=Error%20Report%20${this.state.errorId}&body=${encodeURIComponent(
      `**Error ID:** ${this.state.errorId}\n**Error:** ${this.state.error?.message}\n**URL:** ${window.location.href}\n**Timestamp:** ${new Date().toISOString()}`,
    )}`
    window.open(issueUrl, "_blank")
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-900">Something went wrong</CardTitle>
              <p className="text-gray-600 mt-2">We encountered an unexpected error. Our team has been notified.</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error ID */}
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  Error ID: {this.state.errorId}
                </Badge>
              </div>

              {/* Error Details (Development) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Error Details (Development)
                  </h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>

                <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>

                <Button variant="outline" onClick={this.copyErrorDetails} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Details
                </Button>

                <Button variant="outline" onClick={this.reportIssue} className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Report Issue
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-600">
                <p>
                  If this problem persists, please{" "}
                  <button onClick={this.reportIssue} className="text-blue-600 hover:underline">
                    report the issue
                  </button>{" "}
                  with the error ID above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    // Log error
    console.error("Handled error:", error, errorInfo)

    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // Send to monitoring service
    }
  }

  return { handleError }
}

// Higher-order component for wrapping components
export function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, fallback?: ReactNode) {
  return function WrappedComponent(props: P) {
    return (
      <EnhancedErrorBoundary fallback={fallback}>
        <Component {...props} />
      </EnhancedErrorBoundary>
    )
  }
}
