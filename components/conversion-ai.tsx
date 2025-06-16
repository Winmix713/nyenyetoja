"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Zap,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Code,
  Sparkles,
  Target,
  Lightbulb,
  Shield,
} from "lucide-react"
import { AIConversionService, type AIAnalysis, type AIConversionResult } from "@/services/ai-conversion-service"
import type { WizardState } from "@/hooks/use-wizard-state"

interface ConversionAIProps {
  wizardData: WizardState
  onAnalysisComplete: (analysis: AIAnalysis) => void
  onConversionComplete: (result: AIConversionResult) => void
}

export function ConversionAI({ wizardData, onAnalysisComplete, onConversionComplete }: ConversionAIProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [conversionResult, setConversionResult] = useState<AIConversionResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [conversionProgress, setConversionProgress] = useState(0)

  const startAnalysis = async () => {
    if (!wizardData.figmaData) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      const result = await AIConversionService.analyzeFigmaStructure(wizardData.figmaData)
      setAnalysis(result)
      onAnalysisComplete(result)
      setAnalysisProgress(100)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
      clearInterval(progressInterval)
    }
  }

  const startConversion = async () => {
    if (!analysis) return

    setIsConverting(true)
    setConversionProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setConversionProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 10
      })
    }, 300)

    try {
      const result = await AIConversionService.optimizeCode(wizardData.jsx, wizardData.css, wizardData.figmaCss)
      setConversionResult(result)
      onConversionComplete(result)
      setConversionProgress(100)
    } catch (error) {
      console.error("Conversion failed:", error)
    } finally {
      setIsConverting(false)
      clearInterval(progressInterval)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "low":
        return "text-green-400 bg-green-900/20 border-green-800/30"
      case "medium":
        return "text-yellow-400 bg-yellow-900/20 border-yellow-800/30"
      case "high":
        return "text-red-400 bg-red-900/20 border-red-800/30"
      default:
        return "text-gray-400 bg-gray-900/20 border-gray-800/30"
    }
  }

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case "low":
        return <CheckCircle className="w-4 h-4" />
      case "medium":
        return <AlertTriangle className="w-4 h-4" />
      case "high":
        return <Shield className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Section */}
      <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI Struktúra Elemzés
          </h3>
          {!analysis && !isAnalyzing && (
            <Button onClick={startAnalysis} className="bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Elemzés Indítása
            </Button>
          )}
        </div>

        {isAnalyzing && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-purple-300 font-medium">AI elemzés folyamatban...</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
            <p className="text-gray-400 text-sm">Figma struktúra feldolgozása és komplexitás felmérése...</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${getComplexityColor(analysis.estimatedComplexity)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getComplexityIcon(analysis.estimatedComplexity)}
                  <span className="font-semibold">Komplexitás</span>
                </div>
                <p className="text-sm opacity-90 capitalize">{analysis.estimatedComplexity}</p>
              </div>

              <div className="p-4 rounded-xl border bg-blue-900/20 border-blue-800/30 text-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">Minőségi Pontszám</span>
                </div>
                <p className="text-sm opacity-90">{analysis.qualityScore}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Konverziós Stratégia
                </h4>
                <p className="text-gray-300 text-sm">{analysis.conversionStrategy}</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Optimalizálási Javaslatok
                </h4>
                <ul className="space-y-1">
                  {analysis.optimizationSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {analysis.potentialIssues.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    Potenciális Problémák
                  </h4>
                  <ul className="space-y-1">
                    {analysis.potentialIssues.map((issue, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">⚠</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Conversion Section */}
      {analysis && (
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              AI Kód Optimalizálás
            </h3>
            {!conversionResult && !isConverting && (
              <Button onClick={startConversion} className="bg-yellow-600 hover:bg-yellow-700">
                <Code className="w-4 h-4 mr-2" />
                Konvertálás Indítása
              </Button>
            )}
          </div>

          {isConverting && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-yellow-300 font-medium">AI optimalizálás folyamatban...</span>
              </div>
              <Progress value={conversionProgress} className="h-2" />
              <p className="text-gray-400 text-sm">Kód generálása és optimalizálása a legjobb gyakorlatok alapján...</p>
            </div>
          )}

          {conversionResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-green-900/20 border-green-800/30 text-green-400">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">Minőség</span>
                  </div>
                  <p className="text-sm opacity-90">{conversionResult.qualityScore}%</p>
                </div>

                <div className="p-4 rounded-xl border bg-blue-900/20 border-blue-800/30 text-blue-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4" />
                    <span className="font-semibold">Komponensek</span>
                  </div>
                  <p className="text-sm opacity-90">{conversionResult.componentStructure.length} db</p>
                </div>

                <div className="p-4 rounded-xl border bg-purple-900/20 border-purple-800/30 text-purple-400">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold">Javaslatok</span>
                  </div>
                  <p className="text-sm opacity-90">{conversionResult.performanceRecommendations.length} db</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-semibold mb-2">Komponens Struktúra</h4>
                  <div className="flex flex-wrap gap-2">
                    {conversionResult.componentStructure.map((component, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">Teljesítmény Javaslatok</h4>
                  <ul className="space-y-1">
                    {conversionResult.performanceRecommendations.map((recommendation, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-blue-400 mt-1">→</span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
