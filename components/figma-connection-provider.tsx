"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { initializeFigmaToken } from "@/lib/figma-config"

interface FigmaConnectionContextType {
  isConnected: boolean
  isInitialized: boolean
  error: string | null
}

const FigmaConnectionContext = createContext<FigmaConnectionContextType>({
  isConnected: false,
  isInitialized: false,
  error: null,
})

export function FigmaConnectionProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initialize() {
      try {
        console.log("🚀 Figma kapcsolat inicializálása...")
        const connected = await initializeFigmaToken()

        setIsConnected(connected)
        setError(connected ? null : "Figma API kapcsolat sikertelen")

        console.log(connected ? "✅ Figma automatikusan kapcsolódva" : "❌ Figma kapcsolat sikertelen")
      } catch (err) {
        console.error("❌ Figma inicializálás hiba:", err)
        setError("Inicializálás sikertelen")
        setIsConnected(false)
      } finally {
        setIsInitialized(true)
      }
    }

    initialize()
  }, [])

  return (
    <FigmaConnectionContext.Provider value={{ isConnected, isInitialized, error }}>
      {children}
    </FigmaConnectionContext.Provider>
  )
}

export function useFigmaConnectionContext() {
  return useContext(FigmaConnectionContext)
}
