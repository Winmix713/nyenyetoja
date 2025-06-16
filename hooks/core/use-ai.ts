'use client'

import { useState, useCallback } from 'react'
import { aiProvider, type AIUsageStats } from '@/services/core/ai-provider'
import { useToast } from '@/hooks/ui/use-toast'

export interface AIState {
  isGenerating: boolean
  generatedCode: string | null
  analysisResult: any | null
  error: string | null
  usageStats: AIUsageStats | null
}

export interface AIActions {
  generateCode: (
    designDescription: string,
    options?: {
      framework?: 'react' | 'vue' | 'angular'
      typescript?: boolean
      styleFramework?: 'tailwind' | 'css-modules' | 'styled-components'
      responsive?: boolean
      accessibility?: boolean
    }
  ) => Promise<string>
  analyzeDesign: (designData: any) => Promise<any>
  getUsageStats: () => AIUsageStats
  resetUsageStats: () => void
  clearResults: () => void
}

const initialState: AIState = {
  isGenerating: false,
  generatedCode: null,
  analysisResult: null,
  error: null,
  usageStats: null,
}

export function useAI() {
  const [state, setState] = useState<AIState>(initialState)
  const { toast } = useToast()

  // Generate code from design description
  const generateCode = useCallback(async (
    designDescription: string,
    options: {
      framework?: 'react' | 'vue' | 'angular'
      typescript?: boolean
      styleFramework?: 'tailwind' | 'css-modules' | 'styled-components'
      responsive?: boolean
      accessibility?: boolean
    } = {}
  ): Promise<string> => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }))

    try {
      const code = await aiProvider.generateCode(designDescription, options.framework, options)
      
      setState(prev => ({
        ...prev,
        generatedCode: code,
        isGenerating: false,
        usageStats: aiProvider.getUsageStats(),
      }))

      toast({
        title: 'Code Generated',
        description: 'Successfully generated React component code',
      })

      return code
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Code generation failed'
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
      }))

      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      })

      throw error
    }
  }, [toast])

  // Analyze design and provide recommendations
  const analyzeDesign = useCallback(async (designData: any): Promise<any> => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }))

    try {
      const analysis = await aiProvider.analyzeDesign(designData)
      
      setState(prev => ({
        ...prev,
        analysisResult: analysis,
        isGenerating: false,
        usageStats: aiProvider.getUsageStats(),
      }))

      toast({
        title: 'Analysis Complete',
        description: 'Design analysis completed successfully',
      })

      return analysis
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Design analysis failed'
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
      }))

      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      })

      throw error
    }
  }, [toast])

  // Get AI usage statistics
  const getUsageStats = useCallback((): AIUsageStats => {
    const stats = aiProvider.getUsageStats()
    setState(prev => ({ ...prev, usageStats: stats }))
    return stats
  }, [])

  // Reset usage statistics
  const resetUsageStats = useCallback(() => {
    aiProvider.resetUsageStats()
    setState(prev => ({ ...prev, usageStats: null }))
    
    toast({
      title: 'Stats Reset',
      description: 'AI usage statistics have been reset',
    })
  }, [toast])

  // Clear all results
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      generatedCode: null,
      analysisResult: null,
      error: null,
    }))
  }, [])

  const actions: AIActions = {
    generateCode,
    analyzeDesign,
    getUsageStats,
    resetUsageStats,
    clearResults,
  }

  return {
    ...state,
    ...actions,
  }
}