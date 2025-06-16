"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, X, Sparkles, Upload, Settings, Download, Play, CheckCircle } from "lucide-react"

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right"
  icon: React.ReactNode
  action?: string
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Figma-React Converter!",
    description: "Transform your Figma designs into production-ready React components with AI assistance.",
    target: "body",
    position: "bottom",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "upload",
    title: "Start with Your Figma URL",
    description: "Paste your Figma file URL here. We support public files and files you have access to.",
    target: "[data-tour='figma-url-input']",
    position: "bottom",
    icon: <Upload className="w-5 h-5" />,
    action: "Try pasting a Figma URL",
  },
  {
    id: "wizard",
    title: "Multi-Step Wizard",
    description: "Our intelligent wizard guides you through customization options for optimal results.",
    target: "[data-tour='wizard-stepper']",
    position: "bottom",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    id: "ai-analysis",
    title: "AI-Powered Analysis",
    description: "Our AI analyzes your design patterns and suggests the best component templates.",
    target: "[data-tour='ai-analysis']",
    position: "top",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "export",
    title: "Export Your Components",
    description: "Download as ZIP or push directly to GitHub with full project structure.",
    target: "[data-tour='export-panel']",
    position: "top",
    icon: <Download className="w-5 h-5" />,
  },
]

interface OnboardingTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const currentTourStep = tourSteps[currentStep]

  useEffect(() => {
    if (!isOpen || !currentTourStep) return

    const findTarget = () => {
      const element = document.querySelector(currentTourStep.target) as HTMLElement
      if (element) {
        setTargetElement(element)

        // Calculate tooltip position
        const rect = element.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        let x = rect.left + scrollLeft
        let y = rect.top + scrollTop

        switch (currentTourStep.position) {
          case "bottom":
            x += rect.width / 2
            y += rect.height + 10
            break
          case "top":
            x += rect.width / 2
            y -= 10
            break
          case "right":
            x += rect.width + 10
            y += rect.height / 2
            break
          case "left":
            x -= 10
            y += rect.height / 2
            break
        }

        setTooltipPosition({ x, y })

        // Scroll element into view
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        })

        // Add highlight
        element.style.position = "relative"
        element.style.zIndex = "1001"
        element.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2)"
        element.style.borderRadius = "8px"
      }
    }

    // Try to find target immediately
    findTarget()

    // If not found, try again after a short delay
    const timeout = setTimeout(findTarget, 100)

    return () => {
      clearTimeout(timeout)
      if (targetElement) {
        targetElement.style.position = ""
        targetElement.style.zIndex = ""
        targetElement.style.boxShadow = ""
        targetElement.style.borderRadius = ""
      }
    }
  }, [currentStep, isOpen, currentTourStep, targetElement])

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete()
    onClose()
  }

  const handleSkip = () => {
    onClose()
  }

  if (!isOpen || !currentTourStep) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-1000" onClick={handleSkip} />

      {/* Tooltip */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed z-1002"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform:
              currentTourStep.position === "top" || currentTourStep.position === "bottom"
                ? "translateX(-50%)"
                : currentTourStep.position === "left"
                  ? "translateX(-100%) translateY(-50%)"
                  : "translateY(-50%)",
          }}
        >
          <Card className="w-80 bg-white border-2 border-blue-500 shadow-2xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">{currentTourStep.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{currentTourStep.title}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Step {currentStep + 1} of {tourSteps.length}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSkip} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <p className="text-gray-600 mb-4 leading-relaxed">{currentTourStep.description}</p>

              {/* Action hint */}
              {currentTourStep.action && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentTourStep.action}</span>
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handleSkip} className="text-gray-500">
                    Skip Tour
                  </Button>

                  <Button onClick={nextStep} className="flex items-center gap-2">
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
