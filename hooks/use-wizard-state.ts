"use client"

import { useState, useCallback } from "react"
import { FigmaService } from "@/services/figma-service"
import { FigmaApiService } from "@/services/figma-api-service"

export type Step = 1 | 2 | 3 | 4 | 5

export interface WizardState {
  step: Step
  figmaUrl: string
  figmaData: any
  jsx: string
  css: string
  figmaCss: string
  loading: boolean
  error: string
  stepAnim: boolean
}

export interface WizardActions {
  nextStep: () => Promise<void>
  prevStep: () => void
  goToStep: (step: Step) => void
  setFigmaUrl: (url: string) => void
  setJsx: (jsx: string) => void
  setCss: (css: string) => void
  setFigmaCss: (css: string) => void
  setError: (error: string) => void
  reset: () => void
}

const initialState: WizardState = {
  step: 1,
  figmaUrl: "",
  figmaData: null,
  jsx: "",
  css: "",
  figmaCss: "",
  loading: false,
  error: "",
  stepAnim: false,
}

export function useWizardState(): WizardState & WizardActions {
  const [state, setState] = useState<WizardState>(initialState)

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error, loading: false }))
  }, [])

  const setFigmaUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, figmaUrl: url, error: "" }))
  }, [])

  const setJsx = useCallback((jsx: string) => {
    setState((prev) => ({ ...prev, jsx }))
  }, [])

  const setCss = useCallback((css: string) => {
    setState((prev) => ({ ...prev, css }))
  }, [])

  const setFigmaCss = useCallback((css: string) => {
    setState((prev) => ({ ...prev, figmaCss: css }))
  }, [])

  const validateFigmaUrl = useCallback(
    (url: string): boolean => {
      if (!url.trim()) {
        setError("Figma URL megadása kötelező")
        return false
      }

      const fileKey = FigmaService.extractFileKey(url)
      if (!fileKey) {
        setError("Érvénytelen Figma URL. Használj publikus Figma file linket.")
        return false
      }

      return true
    },
    [setError],
  )

  const fetchFigmaData = useCallback(async (url: string) => {
    const fileKey = FigmaService.extractFileKey(url)
    if (!fileKey) {
      throw new Error("Érvénytelen Figma URL")
    }

    try {
      const { file, nodes, components } = await FigmaApiService.fetchFileData(fileKey)
      const figmaData = {
        ...file,
        nodes,
        components,
        css: FigmaApiService.generateCSS(nodes),
      }
      setState((prev) => ({ ...prev, figmaData }))
      return figmaData
    } catch (error) {
      throw new Error(`Figma file betöltése sikertelen: ${error}`)
    }
  }, [])

  const nextStep = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "", stepAnim: true }))

    try {
      // Step 1 validation and Figma data fetching
      if (state.step === 1) {
        if (!validateFigmaUrl(state.figmaUrl)) {
          return
        }
        await fetchFigmaData(state.figmaUrl)
      }

      // Animate step transition
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          step: Math.min(prev.step + 1, 5) as Step,
          loading: false,
          stepAnim: false,
        }))
      }, 500)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ismeretlen hiba történt")
    }
  }, [state.step, state.figmaUrl, validateFigmaUrl, fetchFigmaData, setError])

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.max(prev.step - 1, 1) as Step,
      error: "",
      stepAnim: true,
    }))

    setTimeout(() => {
      setState((prev) => ({ ...prev, stepAnim: false }))
    }, 300)
  }, [])

  const goToStep = useCallback((step: Step) => {
    setState((prev) => ({ ...prev, step, error: "", stepAnim: true }))
    setTimeout(() => {
      setState((prev) => ({ ...prev, stepAnim: false }))
    }, 300)
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    ...state,
    nextStep,
    prevStep,
    goToStep,
    setFigmaUrl,
    setJsx,
    setCss,
    setFigmaCss,
    setError,
    reset,
  }
}
