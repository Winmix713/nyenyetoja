"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Eye,
  Download,
  Lightbulb,
  Zap,
  Target,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle,
  Brain,
} from "lucide-react"
import {
  AITemplateMatchingService,
  type SmartRecommendation,
  type TemplateMatch,
} from "@/services/ai-template-matching-service"
import type { ComponentTemplate } from "@/lib/component-templates"
import type { FigmaNode } from "@/services/figma-api-service"

interface AITemplateRecommendationsProps {
  figmaNodes: FigmaNode[]
  figmaData: any
  userContext?: {
    industry?: string
    projectType?: string
    targetAudience?: string
  }
  onSelectTemplate: (template: ComponentTemplate) => void
  onPreviewTemplate: (template: ComponentTemplate) => void
  className?: string
}

export function AITemplateRecommendations({
  figmaNodes,
  figmaData,
  userContext,
  onSelectTemplate,
  onPreviewTemplate,
  className = "",
}: AITemplateRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SmartRecommendation | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedMatch, setSelectedMatch] = useState<TemplateMatch | null>(null)

  useEffect(() => {
    if (figmaNodes.length > 0) {
      analyzeDesign()
    }
  }, [figmaNodes, figmaData])

  const analyzeDesign = async () => {
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
    }, 300)

    try {
      const result = await AITemplateMatchingService.findMatchingTemplates(figmaNodes, figmaData, userContext)

      setRecommendations(result)
      setAnalysisProgress(100)

      if (result.primaryMatches.length > 0) {
        setSelectedMatch(result.primaryMatches[0])
      }
    } catch (error) {
      console.error("Template analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
      clearInterval(progressInterval)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-100 border-green-200"
    if (confidence >= 60) return "text-blue-600 bg-blue-100 border-blue-200"
    if (confidence >= 40) return "text-yellow-600 bg-yellow-100 border-yellow-200"
    return "text-gray-600 bg-gray-100 border-gray-200"
  }

  const getPatternIcon = (type: string) => {
    const icons = {
      hero: <Target className="w-4 h-4" />,
      navigation: <Layers className="w-4 h-4" />,
      "card-grid": <Layers className="w-4 h-4" />,
      form: <Layers className="w-4 h-4" />,
      pricing: <TrendingUp className="w-4 h-4" />,
      dashboard: <Layers className="w-4 h-4" />,
    }
    return icons[type as keyof typeof icons] || <Layers className="w-4 h-4" />
  }

  if (isAnalyzing) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Analyzing Your Design</h3>
          <p className="text-gray-600 mb-6">
            Our AI is identifying patterns and finding the perfect template matches...
          </p>
          <div className="max-w-md mx-auto">
            <Progress value={analysisProgress} className="h-3 mb-4" />
            <p className="text-sm text-gray-500">
              {analysisProgress < 30 && "Analyzing design patterns..."}
              {analysisProgress >= 30 && analysisProgress < 60 && "Matching templates..."}
              {analysisProgress >= 60 && analysisProgress < 90 && "Generating recommendations..."}
              {analysisProgress >= 90 && "Finalizing results..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!recommendations) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-8 text-center ${className}`}>
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for AI Analysis</h3>
        <p className="text-gray-600">Upload a Figma design to get intelligent template recommendations</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Design Patterns Detected */}
      {recommendations.designPatterns.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Design Patterns Detected
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.designPatterns.map((pattern, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPatternIcon(pattern.type)}
                    <span className="font-semibold text-gray-900 capitalize">{pattern.type.replace("-", " ")}</span>
                  </div>
                  <Badge className={getConfidenceColor(pattern.confidence)}>{pattern.confidence}%</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Layout: {pattern.layout} • Complexity: {pattern.complexity}
                </p>
                <div className="flex flex-wrap gap-1">
                  {pattern.elements.slice(0, 3).map((element, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {element}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Recommendations */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          AI Recommended Templates
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {recommendations.primaryMatches.map((match, index) => (
            <div
              key={match.template.id}
              className={`border-2 rounded-xl p-4 transition-all cursor-pointer hover:shadow-lg ${
                selectedMatch?.template.id === match.template.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedMatch(match)}
            >
              {/* Template Preview */}
              <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 overflow-hidden">
                <img
                  src={match.template.preview || "/placeholder.svg"}
                  alt={match.template.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getConfidenceColor(match.confidence)}>{match.confidence}% match</Badge>
                </div>
              </div>

              {/* Template Info */}
              <h4 className="font-semibold text-gray-900 mb-2">{match.template.name}</h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{match.reasoning}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPreviewTemplate(match.template)
                  }}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectTemplate(match.template)
                  }}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Use
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Template Details */}
      {selectedMatch && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Selected: {selectedMatch.template.name}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Why This Template?</h4>
              <p className="text-gray-700 mb-4">{selectedMatch.reasoning}</p>

              <h4 className="font-semibold text-gray-900 mb-2">Suggested Modifications</h4>
              <ul className="space-y-1">
                {selectedMatch.suggestedModifications.map((mod, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                    {mod}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Template Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{selectedMatch.template.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Complexity:</span>
                  <Badge
                    className={`text-xs ${
                      selectedMatch.template.complexity === "low"
                        ? "bg-green-100 text-green-800"
                        : selectedMatch.template.complexity === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedMatch.template.complexity}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Compatibility:</span>
                  <span className="font-medium">{selectedMatch.compatibilityScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Downloads:</span>
                  <span className="font-medium">{selectedMatch.template.downloads.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hybrid Suggestions */}
      {recommendations.hybridSuggestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            Hybrid Template Combinations
          </h3>

          <div className="space-y-4">
            {recommendations.hybridSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {suggestion.baseTemplate.name} + {suggestion.additionalComponents.length} Components
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">{suggestion.integrationStrategy}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{suggestion.baseTemplate.name}</Badge>
                      {suggestion.additionalComponents.map((comp, i) => (
                        <Badge key={i} variant="outline">
                          {comp.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Try Combo
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customization Tips */}
      {recommendations.customizationTips.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-orange-600" />
            AI Customization Tips
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.customizationTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
