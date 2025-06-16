"use client"

import { Check } from "lucide-react"
import type { Step } from "@/hooks/use-wizard-state"

interface WizardStepperProps {
  currentStep: Step
  totalSteps: number
  onStepClick: (step: Step) => void
}

const stepLabels = ["Figma URL", "JSX Kód", "Saját CSS", "Figma CSS", "Összegzés"]

export function WizardStepper({ currentStep, totalSteps, onStepClick }: WizardStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = (index + 1) as Step
        const isActive = currentStep === step
        const isCompleted = currentStep > step
        const isClickable = step <= currentStep

        return (
          <div key={step} className="flex items-center">
            <div
              className={`
                relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold 
                transition-all duration-300 cursor-pointer group
                ${
                  isActive
                    ? "bg-white text-black shadow-lg shadow-white/20 scale-110"
                    : isCompleted
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20"
                      : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                }
                ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
              `}
              onClick={() => isClickable && onStepClick(step)}
              title={stepLabels[index]}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-bold">{step}</span>}

              {/* Pulse effect for current step */}
              {isActive && <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-20"></div>}
            </div>

            {index < totalSteps - 1 && (
              <div
                className={`
                  w-12 h-0.5 mx-3 transition-all duration-500 rounded-full
                  ${
                    isCompleted
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm shadow-green-500/30"
                      : "bg-gray-700"
                  }
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
