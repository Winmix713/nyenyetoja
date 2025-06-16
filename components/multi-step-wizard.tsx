"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { WizardStepper } from "./wizard-stepper"
import { WizardSteps } from "./wizard-steps"
import { ConversionAI } from "./conversion-ai"
import { useWizardState } from "@/hooks/use-wizard-state"
import type { AIAnalysis, AIConversionResult } from "@/services/ai-conversion-service"

interface MultiStepWizardProps {
  onComplete: (output: {
    figmaData?: any
    jsx: string
    css: string
    figmaCss: string
    figmaUrl: string
  }) => void
}

export function MultiStepWizard({ onComplete }: MultiStepWizardProps) {
  const wizardState = useWizardState()
  const { step, figmaUrl, jsx, css, figmaCss, figmaData, loading, error, nextStep, prevStep, goToStep, reset } =
    wizardState

  const handleAnalysisComplete = (analysis: AIAnalysis) => {
    console.log("✅ AI Analysis completed:", analysis)
  }

  const handleConversionComplete = (result: AIConversionResult) => {
    console.log("✅ AI Conversion completed:", result)

    // Complete the wizard with optimized results
    onComplete({
      figmaData,
      jsx: result.optimizedJsx || jsx,
      css: result.optimizedCss || css,
      figmaCss,
      figmaUrl,
    })
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return figmaUrl.trim() !== "" && !loading
      case 2:
      case 3:
      case 4:
        return true
      case 5:
        return figmaData !== null
      default:
        return false
    }
  }

  const isLastStep = step === 5

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative bg-gray-900/80 border border-gray-800/50 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-transparent to-gray-900/20 rounded-2xl"></div>

        <div className="relative z-10">
          {/* Step Indicator */}
          <WizardStepper currentStep={step} totalSteps={5} onStepClick={goToStep} />

          {/* Step Content */}
          <div className="mb-10">
            <WizardSteps wizardState={wizardState} wizardActions={wizardState} />
          </div>

          {/* AI Conversion (only on step 5) */}
          {step === 5 && figmaData && (
            <div className="mb-8">
              <ConversionAI
                wizardData={wizardState}
                onAnalysisComplete={handleAnalysisComplete}
                onConversionComplete={handleConversionComplete}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              onClick={prevStep}
              disabled={step === 1}
              variant="outline"
              className="group flex items-center space-x-2 px-6 py-3 bg-transparent border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-800/50 hover:text-white hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="font-medium">Vissza</span>
            </Button>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 font-medium">{step} / 5</span>

              {!isLastStep ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed() || loading}
                  className="group flex items-center space-x-2 px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-100 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:scale-100 transition-all duration-200 font-semibold shadow-lg shadow-white/10"
                >
                  <span>Tovább</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Button>
              ) : (
                <Button
                  onClick={reset}
                  variant="outline"
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Új Konvertálás
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
