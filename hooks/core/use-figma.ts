'use client'

import { useState, useCallback, useEffect } from 'react'
import { figmaClient, type FigmaFileResponse, type ConnectionResult } from '@/services/core/figma-client'
import { useToast } from '@/hooks/ui/use-toast'

export interface FigmaState {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  fileData: FigmaFileResponse | null
  connectionResult: ConnectionResult | null
}

export interface FigmaActions {
  connect: (token: string) => Promise<boolean>
  disconnect: () => void
  loadFile: (url: string) => Promise<void>
  testConnection: () => Promise<boolean>
  validateUrl: (url: string) => Promise<{ valid: boolean; fileKey?: string; error?: string }>
  clearCache: () => Promise<void>
}

const initialState: FigmaState = {
  isConnected: false,
  isLoading: false,
  error: null,
  fileData: null,
  connectionResult: null,
}

export function useFigma() {
  const [state, setState] = useState<FigmaState>(initialState)
  const { toast } = useToast()

  // Connect to Figma
  const connect = useCallback(async (token: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      figmaClient.setToken(token)
      const result = await figmaClient.testConnection()

      setState(prev => ({
        ...prev,
        isConnected: result.success,
        connectionResult: result,
        isLoading: false,
        error: result.error || null,
      }))

      if (result.success) {
        toast({
          title: 'Connected to Figma',
          description: `Successfully connected as ${result.user?.handle || 'User'}`,
        })
        
        // Store token securely
        if (typeof window !== 'undefined') {
          localStorage.setItem('figma-token', token)
        }
      } else {
        toast({
          title: 'Connection Failed',
          description: result.error || 'Failed to connect to Figma',
          variant: 'destructive',
        })
      }

      return result.success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed'
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: errorMessage,
      }))

      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive',
      })

      return false
    }
  }, [toast])

  // Disconnect from Figma
  const disconnect = useCallback(() => {
    setState(initialState)
    
    // Clear stored token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('figma-token')
    }

    toast({
      title: 'Disconnected',
      description: 'Disconnected from Figma',
    })
  }, [toast])

  // Load a Figma file
  const loadFile = useCallback(async (url: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const fileKey = figmaClient.constructor.extractFileKey(url)
      if (!fileKey) {
        throw new Error('Invalid Figma URL')
      }

      const fileData = await figmaClient.getFile(fileKey)

      setState(prev => ({
        ...prev,
        fileData,
        isLoading: false,
      }))

      toast({
        title: 'File Loaded',
        description: `Successfully loaded "${fileData.name}"`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load file'
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))

      toast({
        title: 'Load Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }, [toast])

  // Test connection
  const testConnection = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const result = await figmaClient.testConnection()
      
      setState(prev => ({
        ...prev,
        isConnected: result.success,
        connectionResult: result,
        isLoading: false,
        error: result.error || null,
      }))

      return result.success
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      }))
      return false
    }
  }, [])

  // Validate Figma URL
  const validateUrl = useCallback(async (url: string) => {
    return await figmaClient.validateUrl(url)
  }, [])

  // Clear cache
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      await figmaClient.clearAllCache()
      toast({
        title: 'Cache Cleared',
        description: 'Figma cache has been cleared',
      })
    } catch (error) {
      toast({
        title: 'Cache Error',
        description: 'Failed to clear cache',
        variant: 'destructive',
      })
    }
  }, [toast])

  // Auto-connect on mount if token exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('figma-token')
      if (storedToken && !state.isConnected) {
        connect(storedToken)
      }
    }
  }, [connect, state.isConnected])

  const actions: FigmaActions = {
    connect,
    disconnect,
    loadFile,
    testConnection,
    validateUrl,
    clearCache,
  }

  return {
    ...state,
    ...actions,
  }
}