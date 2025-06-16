"use client"

import { useState, useEffect } from "react"
import { SecureTokenStorage } from "@/lib/security"

export function useSecureStorage(key: string, defaultValue = "") {
  const [value, setValue] = useState<string>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = SecureTokenStorage.retrieve(key)
      if (stored) {
        setValue(stored)
      }
    } catch (error) {
      console.error("Failed to load from secure storage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [key])

  const setSecureValue = (newValue: string) => {
    try {
      setValue(newValue)
      if (newValue) {
        SecureTokenStorage.store(key, newValue)
      } else {
        SecureTokenStorage.remove(key)
      }
    } catch (error) {
      console.error("Failed to save to secure storage:", error)
    }
  }

  const clearValue = () => {
    setValue("")
    SecureTokenStorage.remove(key)
  }

  return {
    value,
    setValue: setSecureValue,
    clearValue,
    isLoading,
  }
}
