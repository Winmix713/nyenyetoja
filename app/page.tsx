"use client"

import { useState, useEffect } from "react"
import { FigmaConnectionProvider } from "@/components/figma-connection-provider"
import { FigmaStatusToast } from "@/components/figma-status-toast"
import Header from "@/header"
import FigmaConverter from "@/components/figma-converter"
import { PerformanceMonitorPanel } from "@/components/performance-monitor"
import { OnboardingTour } from "@/components/advanced-ux/onboarding-tour"
import { SmartNotifications, useSmartNotifications } from "@/components/advanced-ux/smart-notifications"
import { EnhancedErrorBoundary } from "@/components/bug-fixes/error-boundary"
import { ErrorTrigger } from "@/components/test/error-trigger"
import { Button } from "@/components/ui/button"
import { Bug } from "lucide-react"

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showErrorTesting, setShowErrorTesting] = useState(false)
  const notifications = useSmartNotifications()

  // Check if user is new (first visit)
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited")
    if (!hasVisited) {
      setShowOnboarding(true)
      localStorage.setItem("hasVisited", "true")
    }

    // Welcome notification for returning users
    if (hasVisited) {
      notifications.info("Welcome back!", "Ready to convert more Figma designs to React components?", {
        label: "Start Converting",
        onClick: () => {
          const input = document.querySelector('[data-tour="figma-url-input"]') as HTMLInputElement
          input?.focus()
        },
      })
    }
  }, [])

  const handleOnboardingComplete = () => {
    notifications.success(
      "Tour Complete!",
      "You're all set to start converting your Figma designs. Try pasting a Figma URL to get started.",
      {
        label: "Start Now",
        onClick: () => {
          const input = document.querySelector('[data-tour="figma-url-input"]') as HTMLInputElement
          input?.focus()
        },
      },
    )
  }

  const handleError = (error: Error) => {
    notifications.error("Application Error", error.message, {
      label: "Reload Page",
      onClick: () => window.location.reload(),
    })
  }

  const handleAsyncError = (error: Error) => {
    notifications.error("Async Error Caught", error.message, {
      label: "Retry",
      onClick: () => {
        notifications.info("Retrying...", "Attempting to recover from the error")
      },
    })
  }

  return (
    <EnhancedErrorBoundary onError={handleError}>
      <FigmaConnectionProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Header />

          <main className="container mx-auto px-4 py-8 space-y-8">
            {/* Error Testing Toggle */}
            <div className="flex justify-center">
              <Button
                variant={showErrorTesting ? "destructive" : "outline"}
                onClick={() => setShowErrorTesting(!showErrorTesting)}
                className="flex items-center gap-2"
              >
                <Bug className="w-4 h-4" />
                {showErrorTesting ? "Hide Error Testing" : "Test Error Boundary"}
              </Button>
            </div>

            {/* Error Testing Component */}
            {showErrorTesting && (
              <EnhancedErrorBoundary
                onError={(error) => {
                  console.log("Error caught by test boundary:", error)
                  notifications.error("Test Error Caught", error.message)
                }}
                fallback={
                  <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">🎯 Error Boundary Test Successful!</h3>
                    <p className="text-red-700 mb-4">
                      The error boundary caught the error and displayed this custom fallback UI.
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Reset Test
                    </Button>
                  </div>
                }
              >
                <ErrorTrigger onError={handleAsyncError} />
              </EnhancedErrorBoundary>
            )}

            {/* Main Application */}
            <FigmaConverter />
          </main>

          {/* Advanced UX Features */}
          <OnboardingTour
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            onComplete={handleOnboardingComplete}
          />

          <SmartNotifications
            notifications={notifications.notifications}
            onDismiss={notifications.dismissNotification}
            onDismissAll={notifications.dismissAll}
            position="top-right"
            maxVisible={3}
          />

          {/* Performance Monitor */}
          <PerformanceMonitorPanel />

          {/* Figma Status Toast */}
          <FigmaStatusToast />
        </div>
      </FigmaConnectionProvider>
    </EnhancedErrorBoundary>
  )
}
