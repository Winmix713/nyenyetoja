"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Loader2, Zap, Target, Sparkles } from "lucide-react"

export interface ProgressStep {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "error"
  progress?: number
  duration?: number
  details?: string
  estimatedTime?: number
}

interface ProgressTrackerProps {
  steps: ProgressStep[]
  currentStep?: string
  onStepClick?: (stepId: string) => void
  className?: string
}

export function ProgressTracker({ steps, currentStep, onStepClick, className = "" }: ProgressTrackerProps) {
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({})

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTimes((prev) => {
        const updated = { ...prev }
        steps.forEach((step) => {
          if (step.status === "in-progress") {
            updated[step.id] = (updated[step.id] || 0) + 1
          }
        })
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [steps])

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "in-progress":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStepColor = (step: ProgressStep) => {
    switch (step.status) {
      case "completed":
        return "border-green-200 bg-green-50"
      case "in-progress":
        return "border-blue-200 bg-blue-50"
      case "error":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const completedSteps = steps.filter((s) => s.status === "completed").length
  const totalSteps = steps.length
  const overallProgress = (completedSteps / totalSteps) * 100

  return (
    <Card className={`bg-white border border-gray-200 ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Conversion Progress
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {completedSteps} of {totalSteps} steps completed
            </p>
          </div>
          <Badge variant={overallProgress === 100 ? "default" : "secondary"} className="flex items-center gap-1">
            {overallProgress === 100 ? <Sparkles className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
            {Math.round(overallProgress)}%
          </Badge>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${getStepColor(step)} ${
                onStepClick ? "cursor-pointer hover:shadow-md" : ""
              } ${currentStep === step.id ? "ring-2 ring-blue-500 ring-opacity-50" : ""}`}
              onClick={() => onStepClick?.(step.id)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">{getStepIcon(step)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {step.status === "in-progress" && elapsedTimes[step.id] && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(elapsedTimes[step.id])}
                        </span>
                      )}
                      {step.duration && step.status === "completed" && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {formatTime(step.duration)}
                        </span>
                      )}
                      {step.estimatedTime && step.status === "pending" && (
                        <span className="text-gray-400">~{formatTime(step.estimatedTime)}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                  {/* Progress bar for current step */}
                  {step.status === "in-progress" && step.progress !== undefined && (
                    <div className="mb-2">
                      <Progress value={step.progress} className="h-2" />
                    </div>
                  )}

                  {/* Details */}
                  {step.details && (
                    <p className="text-xs text-gray-500 bg-white/50 p-2 rounded border">{step.details}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        {overallProgress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Conversion Complete!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your Figma design has been successfully converted to React components.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
