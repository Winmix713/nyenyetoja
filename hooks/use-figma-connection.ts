"use client"

import { useState, useEffect } from "react"
import { initializeFigmaToken, testFigmaConnection } from "@/lib/figma-config"

export function useFigmaConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true)
        setError(null)

        // Automatikus inicializálás
        const connected = await initializeFigmaToken()
        setIsConnected(connected)

        if (!connected) {
          setError("Figma API kapcsolat sikertelen. Ellenőrizd a tokent.")
        }
      } catch (err) {
        setError("Figma inicializálás sikertelen")
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  const reconnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const connected = await testFigmaConnection()
      setIsConnected(connected)

      if (!connected) {
        setError("Újracsatlakozás sikertelen")
      }
    } catch (err) {
      setError("Kapcsolat hiba")
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isConnected,
    isLoading,
    error,
    reconnect,
  }
}
