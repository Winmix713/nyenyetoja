"use client"

import { useEffect } from "react"
import { useFigmaConnectionContext } from "./figma-connection-provider"
import { useToast } from "@/hooks/use-toast"

export function FigmaStatusToast() {
  const { isConnected, isInitialized, error } = useFigmaConnectionContext()
  const { toast } = useToast()

  useEffect(() => {
    if (!isInitialized) return

    if (isConnected) {
      toast({
        title: "✅ Figma kapcsolat sikeres",
        description: "Az alkalmazás készen áll a használatra",
        duration: 3000,
      })
    } else if (error) {
      toast({
        title: "❌ Figma kapcsolat sikertelen",
        description: error,
        variant: "destructive",
        duration: 5000,
      })
    }
  }, [isConnected, isInitialized, error, toast])

  return null
}
