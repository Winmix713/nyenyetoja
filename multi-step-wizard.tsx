"use client"

import { useState } from "react"
import { CircleX, Edit, Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { useFigmaApi } from "@/hooks/use-figma-api"

const steps = [
  { id: 1, title: "Figma URL megadása", description: "Add meg a Figma file publikus linkjét" },
  { id: 2, title: "Komponensek kiválasztása", description: "Válaszd ki a konvertálandó komponenseket" },
  { id: 3, title: "Beállítások", description: "Állítsd be a konverziós opciókat" },
  { id: 4, title: "Generálás", description: "React komponensek generálása" },
  { id: 5, title: "Letöltés", description: "Kész komponensek letöltése" },
]

export default function MultiStepWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [figmaUrl, setFigmaUrl] = useState("")
  const { isConnected, isLoading, error, reconnect, updateToken } = useFigmaApi()

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleApiStatusClick = () => {
    if (!isConnected && !isLoading) {
      reconnect()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
      {/* Main Wizard Container */}
      <div className="w-full max-w-3xl mx-auto">
        {/* Background with glassmorphism effect */}
        <div className="relative bg-gray-900/80 border border-gray-800/50 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-transparent to-gray-900/20 rounded-2xl"></div>

          <div className="relative z-10">
            {/* Connection Status Banner */}
            {isLoading && (
              <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-blue-300 text-sm font-medium">Figma API kapcsolat inicializálása...</span>
                </div>
              </div>
            )}

            {error && !isLoading && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-800/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CircleX className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 text-sm font-medium">{error}</span>
                  </div>
                  <button onClick={reconnect} className="text-red-400 hover:text-red-300 text-sm font-medium underline">
                    Újrapróbálás
                  </button>
                </div>
              </div>
            )}

            {isConnected && !isLoading && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-800/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">
                    Figma API sikeresen kapcsolódva - Készen állsz a konverzióra!
                  </span>
                </div>
              </div>
            )}

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-10">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                      relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 group
                      ${
                        currentStep === step.id
                          ? "bg-white text-black shadow-lg shadow-white/20 scale-110"
                          : currentStep > step.id
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20"
                            : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                      }
                    `}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="font-bold">{step.id}</span>
                    )}

                    {/* Pulse effect for current step */}
                    {currentStep === step.id && (
                      <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-20"></div>
                    )}
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`
                        w-16 h-0.5 mx-3 transition-all duration-500 rounded-full
                        ${
                          currentStep > step.id
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm shadow-green-500/30"
                            : "bg-gray-700"
                        }
                      `}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="mb-10 min-h-[280px]">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{steps[currentStep - 1].title}</h3>
                <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
                  {steps[currentStep - 1].description}
                </p>
              </div>

              {/* Step 1 Content */}
              {currentStep === 1 && (
                <div className="space-y-6 max-w-lg mx-auto">
                  <div>
                    <label htmlFor="figma-url" className="block text-sm font-semibold text-gray-300 mb-3">
                      Figma File URL
                    </label>
                    <div className="relative">
                      <input
                        id="figma-url"
                        type="text"
                        placeholder="https://www.figma.com/file/..."
                        value={figmaUrl}
                        onChange={(e) => setFigmaUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-white/10 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                        disabled={!isConnected}
                      />
                      {figmaUrl && isConnected && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Check className="w-5 h-5 text-green-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4">
                    <p className="text-xs text-blue-300 leading-relaxed">
                      <strong>Automatikus kapcsolat:</strong> Az alkalmazás automatikusan kapcsolódik a Figma API-hoz
                      indításkor.
                      {isConnected
                        ? " A kapcsolat aktív, készen állsz a konverzióra!"
                        : " Várd meg a kapcsolat létrejöttét."}
                    </p>
                  </div>
                </div>
              )}

              {/* Placeholder for other steps */}
              {currentStep > 1 && (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 space-y-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">{currentStep}</span>
                  </div>
                  <p className="text-center">
                    <span className="font-semibold">Lépés {currentStep}</span> tartalma itt jelenik meg
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="group flex items-center space-x-2 px-6 py-3 bg-transparent border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-800/50 hover:text-white hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300 disabled:hover:border-gray-700/50 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span className="font-medium">Vissza</span>
              </button>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 font-medium">
                  {currentStep} / {steps.length}
                </span>

                <button
                  onClick={handleNext}
                  disabled={
                    currentStep === steps.length ||
                    (currentStep === 1 && (!figmaUrl.trim() || !isConnected)) ||
                    isLoading
                  }
                  className="group flex items-center space-x-2 px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-100 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:scale-100 transition-all duration-200 font-semibold shadow-lg shadow-white/10"
                >
                  <span>{currentStep === steps.length ? "Befejezés" : "Tovább"}</span>
                  {currentStep < steps.length && (
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Status Indicator */}
      <button
        onClick={handleApiStatusClick}
        title={
          isLoading
            ? "API kapcsolat inicializálása..."
            : isConnected
              ? "API kapcsolat aktív"
              : "API kapcsolat sikertelen - kattints az újrapróbáláshoz"
        }
        className={`
          fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl
          border transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95
          backdrop-blur-xl shadow-lg group
          ${
            isLoading
              ? "bg-blue-900/80 border-blue-700/50 text-blue-100 shadow-blue-500/20"
              : isConnected
                ? "bg-green-900/80 border-green-700/50 text-green-100 shadow-green-500/20"
                : "bg-red-900/80 border-red-700/50 text-red-100 shadow-red-500/20"
          }
        `}
      >
        <div className="relative">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          ) : isConnected ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <CircleX className="w-4 h-4 text-red-400" />
          )}

          {/* Pulse animation for loading/disconnected state */}
          {(isLoading || !isConnected) && (
            <div
              className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
                isLoading ? "bg-blue-400" : "bg-red-400"
              }`}
            ></div>
          )}
        </div>

        <span className="text-sm font-semibold">
          {isLoading ? "Kapcsolódás..." : isConnected ? "Kapcsolódva" : "Nincs kapcsolat"}
        </span>

        <Edit className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
      </button>
    </div>
  )
}
