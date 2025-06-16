"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Bug, Zap, Database, Network } from "lucide-react"

interface ErrorTriggerProps {
  onError?: (error: Error) => void
}

export function ErrorTrigger({ onError }: ErrorTriggerProps) {
  const [shouldThrow, setShouldThrow] = useState(false)

  // Different types of errors to test
  const triggerRenderError = () => {
    setShouldThrow(true)
  }

  const triggerAsyncError = async () => {
    try {
      // Simulate API call that fails
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Simulated API failure: Unable to connect to Figma API"))
        }, 1000)
      })
    } catch (error) {
      onError?.(error as Error)
      throw error
    }
  }

  const triggerTypeError = () => {
    // This will cause a TypeError
    const obj: any = null
    console.log(obj.property.nested)
  }

  const triggerNetworkError = () => {
    throw new Error("Network Error: Failed to fetch design data from Figma")
  }

  const triggerValidationError = () => {
    throw new Error("Validation Error: Invalid Figma URL format provided")
  }

  // This will trigger the error boundary
  if (shouldThrow) {
    throw new Error("Component Render Error: This is a test error to demonstrate the error boundary functionality")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Bug className="w-5 h-5" />
          Error Boundary Testing
        </CardTitle>
        <p className="text-sm text-orange-700">
          Test different types of errors to see how the enhanced error boundary handles them.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="destructive" onClick={triggerRenderError} className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Render Error
          </Button>

          <Button variant="destructive" onClick={triggerAsyncError} className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Async Error
          </Button>

          <Button variant="destructive" onClick={triggerTypeError} className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Type Error
          </Button>

          <Button variant="destructive" onClick={triggerNetworkError} className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Network Error
          </Button>

          <Button
            variant="destructive"
            onClick={triggerValidationError}
            className="flex items-center gap-2 md:col-span-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Validation Error
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <h4 className="font-medium text-orange-900 mb-2">What to expect:</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>
              • <strong>Render Error:</strong> Will trigger the error boundary and show the error UI
            </li>
            <li>
              • <strong>Async Error:</strong> Will be caught and handled gracefully
            </li>
            <li>
              • <strong>Type Error:</strong> Will demonstrate JavaScript error handling
            </li>
            <li>
              • <strong>Network Error:</strong> Simulates API connection failures
            </li>
            <li>
              • <strong>Validation Error:</strong> Shows input validation error handling
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-2 text-xs text-orange-600">
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            Safe Testing Environment
          </Badge>
          <span>These errors are simulated and won't affect your data</span>
        </div>
      </CardContent>
    </Card>
  )
}
