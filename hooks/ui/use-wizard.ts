'use client'

import { useState, useCallback, useEffect } from 'react'

export interface WizardStep {
  id: string
  title: string
  description?: string
  isCompleted: boolean
  isValid: boolean
  isOptional?: boolean
  data?: any
}

export interface WizardState {
  steps: WizardStep[]
  currentStepIndex: number
  isLoading: boolean
  canGoNext: boolean
  canGoPrevious: boolean
  isCompleted: boolean
  progress: number
}

export interface WizardActions {
  goToStep: (stepIndex: number) => void
  nextStep: () => void
  previousStep: () => void
  updateStepData: (stepId: string, data: any) => void
  markStepCompleted: (stepId: string, completed: boolean) => void
  markStepValid: (stepId: string, valid: boolean) => void
  resetWizard: () => void
  completeWizard: () => void
}

export interface WizardConfig {
  steps: Omit<WizardStep, 'isCompleted' | 'isValid'>[]
  persistState?: boolean
  storageKey?: string
}

export function useWizard(config: WizardConfig) {
  const { steps: initialSteps, persistState = false, storageKey = 'wizard-state' } = config

  // Initialize steps with default states
  const [state, setState] = useState<WizardState>(() => {
    const steps: WizardStep[] = initialSteps.map(step => ({
      ...step,
      isCompleted: false,
      isValid: false,
    }))

    const initialState: WizardState = {
      steps,
      currentStepIndex: 0,
      isLoading: false,
      canGoNext: false,
      canGoPrevious: false,
      isCompleted: false,
      progress: 0,
    }

    // Load persisted state if enabled
    if (persistState && typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem(storageKey)
        if (savedState) {
          const parsed = JSON.parse(savedState)
          return { ...initialState, ...parsed }
        }
      } catch (error) {
        console.warn('Failed to load wizard state from localStorage:', error)
      }
    }

    return initialState
  })

  // Calculate derived state
  const updateDerivedState = useCallback((newState: Partial<WizardState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState }
      
      // Calculate progress
      const completedSteps = updatedState.steps.filter(step => step.isCompleted).length
      const totalSteps = updatedState.steps.length
      updatedState.progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

      // Calculate navigation state
      const currentStep = updatedState.steps[updatedState.currentStepIndex]
      updatedState.canGoNext = currentStep ? currentStep.isValid || currentStep.isOptional : false
      updatedState.canGoPrevious = updatedState.currentStepIndex > 0

      // Check if wizard is completed
      updatedState.isCompleted = updatedState.steps.every(step => 
        step.isCompleted || step.isOptional
      )

      return updatedState
    })
  }, [])

  // Go to specific step
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      updateDerivedState({ currentStepIndex: stepIndex })
    }
  }, [state.steps.length, updateDerivedState])

  // Go to next step
  const nextStep = useCallback(() => {
    if (state.canGoNext && state.currentStepIndex < state.steps.length - 1) {
      updateDerivedState({ currentStepIndex: state.currentStepIndex + 1 })
    }
  }, [state.canGoNext, state.currentStepIndex, state.steps.length, updateDerivedState])

  // Go to previous step
  const previousStep = useCallback(() => {
    if (state.canGoPrevious && state.currentStepIndex > 0) {
      updateDerivedState({ currentStepIndex: state.currentStepIndex - 1 })
    }
  }, [state.canGoPrevious, state.currentStepIndex, updateDerivedState])

  // Update step data
  const updateStepData = useCallback((stepId: string, data: any) => {
    const updatedSteps = state.steps.map(step =>
      step.id === stepId ? { ...step, data: { ...step.data, ...data } } : step
    )
    updateDerivedState({ steps: updatedSteps })
  }, [state.steps, updateDerivedState])

  // Mark step as completed
  const markStepCompleted = useCallback((stepId: string, completed: boolean) => {
    const updatedSteps = state.steps.map(step =>
      step.id === stepId ? { ...step, isCompleted: completed } : step
    )
    updateDerivedState({ steps: updatedSteps })
  }, [state.steps, updateDerivedState])

  // Mark step as valid
  const markStepValid = useCallback((stepId: string, valid: boolean) => {
    const updatedSteps = state.steps.map(step =>
      step.id === stepId ? { ...step, isValid: valid } : step
    )
    updateDerivedState({ steps: updatedSteps })
  }, [state.steps, updateDerivedState])

  // Reset wizard to initial state
  const resetWizard = useCallback(() => {
    const steps: WizardStep[] = initialSteps.map(step => ({
      ...step,
      isCompleted: false,
      isValid: false,
    }))

    updateDerivedState({
      steps,
      currentStepIndex: 0,
      isLoading: false,
    })

    // Clear persisted state
    if (persistState && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }, [initialSteps, persistState, storageKey, updateDerivedState])

  // Complete wizard
  const completeWizard = useCallback(() => {
    const updatedSteps = state.steps.map(step => ({ ...step, isCompleted: true }))
    updateDerivedState({ steps: updatedSteps })
  }, [state.steps, updateDerivedState])

  // Persist state to localStorage
  useEffect(() => {
    if (persistState && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          steps: state.steps,
          currentStepIndex: state.currentStepIndex,
        }))
      } catch (error) {
        console.warn('Failed to persist wizard state to localStorage:', error)
      }
    }
  }, [state.steps, state.currentStepIndex, persistState, storageKey])

  const actions: WizardActions = {
    goToStep,
    nextStep,
    previousStep,
    updateStepData,
    markStepCompleted,
    markStepValid,
    resetWizard,
    completeWizard,
  }

  return {
    ...state,
    ...actions,
    currentStep: state.steps[state.currentStepIndex] || null,
  }
}

// Utility hook for managing form validation within wizard steps
export function useWizardStep(
  stepId: string,
  wizard: ReturnType<typeof useWizard>,
  validationFn?: (data: any) => boolean
) {
  const step = wizard.steps.find(s => s.id === stepId)
  
  const updateData = useCallback((data: any) => {
    wizard.updateStepData(stepId, data)

    // Auto-validate if validation function provided
    if (validationFn) {
      const isValid = validationFn(data)
      wizard.markStepValid(stepId, isValid)
    }
  }, [stepId, wizard, validationFn])

  const markCompleted = useCallback((completed = true) => {
    wizard.markStepCompleted(stepId, completed)
  }, [stepId, wizard])

  const markValid = useCallback((valid = true) => {
    wizard.markStepValid(stepId, valid)
  }, [stepId, wizard])

  return {
    step,
    updateData,
    markCompleted,
    markValid,
    isCurrentStep: wizard.currentStep?.id === stepId,
  }
}