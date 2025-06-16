"use client"

import { useState, useCallback } from "react"
import { AITemplateMatchingService, type SmartRecommendation } from "@/services/ai-template-matching-service"
import type { FigmaNode } from "@/services/figma-api-service"
import type { ComponentTemplate } from "@/lib/component-templates"

interface UseAIRecommendationsProps {
  onTemplateSelect?: (template: ComponentTemplate) => void
  onAnalysisComplete?: (recommendations: SmartRecommendation) => void
}

export function useAIRecommendations({ onTemplateSelect, onAnalysisComplete }: UseAIRecommendationsProps = {}) {
  const [recommendations, setRecommendations] = useState<SmartRecommendation | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<
    {
      timestamp: string
      figmaUrl: string
      recommendations: SmartRecommendation
    }[]
  >([])

  const analyzeDesign = useCallback(
    async (
      figmaNodes: FigmaNode[],
      figmaData: any,
      userContext?: {
        industry?: string
        projectType?: string
        targetAudience?: string
      },
    ) => {
      if (figmaNodes.length === 0) {
        setError("No Figma nodes to analyze")
        return null
      }

      setIsAnalyzing(true)
      setError(null)

      try {
        const result = await AITemplateMatchingService.findMatchingTemplates(figmaNodes, figmaData, userContext)

        setRecommendations(result)
        onAnalysisComplete?.(result)

        // Add to history
        setAnalysisHistory((prev) => [
          {
            timestamp: new Date().toISOString(),
            figmaUrl: figmaData?.name || "Unknown",
            recommendations: result,
          },
          ...prev.slice(0, 9),
        ]) // Keep last 10 analyses

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Analysis failed"
        setError(errorMessage)
        console.error("AI Recommendations error:", err)
        return null
      } finally {
        setIsAnalyzing(false)
      }
    },
    [onAnalysisComplete],
  )

  const selectTemplate = useCallback(
    (template: ComponentTemplate) => {
      onTemplateSelect?.(template)
    },
    [onTemplateSelect],
  )

  const getTemplatesByPattern = useCallback((patternType: string) => {
    return AITemplateMatchingService.getTemplatesByPattern(patternType as any)
  }, [])

  const clearRecommendations = useCallback(() => {
    setRecommendations(null)
    setError(null)
  }, [])

  const retryAnalysis = useCallback(
    (figmaNodes: FigmaNode[], figmaData: any, userContext?: any) => {
      return analyzeDesign(figmaNodes, figmaData, userContext)
    },
    [analyzeDesign],
  )

  return {
    recommendations,
    isAnalyzing,
    error,
    analysisHistory,
    analyzeDesign,
    selectTemplate,
    getTemplatesByPattern,
    clearRecommendations,
    retryAnalysis,

    // Computed values
    hasRecommendations: recommendations !== null,
    primaryMatches: recommendations?.primaryMatches || [],
    alternativeMatches: recommendations?.alternativeMatches || [],
    hybridSuggestions: recommendations?.hybridSuggestions || [],
    designPatterns: recommendations?.designPatterns || [],
    customizationTips: recommendations?.customizationTips || [],
  }
}
