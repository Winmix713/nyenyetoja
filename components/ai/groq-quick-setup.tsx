"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { testGroqConnection } from "@/lib/groq-client"
import { CheckCircle, XCircle, Loader2, Zap, Key } from "lucide-react"

export function GroqQuickSetup() {
  const [apiKey, setApiKey] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Auto-initialize with provided key or check existing
    const initializeGroq = async () => {
      // First try the provided key
      const providedKey = "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"

      // Check if there's already a stored key
      const storedKey = localStorage.getItem("groq_api_key")

      const keyToTest = storedKey || providedKey

      if (keyToTest) {
        setApiKey(keyToTest)
        await testConnection(keyToTest, true)

        // If using provided key and it works, store it
        if (!storedKey && keyToTest === providedKey) {
          localStorage.setItem("groq_api_key", providedKey)
        }
      }

      setIsInitializing(false)
    }

    initializeGroq()
  }, [])

  const testConnection = async (key: string, silent = false) => {
    if (!silent) setIsLoading(true)
    setError("")

    try {
      const connected = await testGroqConnection(key)
      setIsConnected(connected)

      if (connected) {
        localStorage.setItem("groq_api_key", key)
        if (!silent) {
          // Success feedback could go here
        }
      } else {
        setError("Connection failed. Please check your API key.")
      }
    } catch (err) {
      setIsConnected(false)
      setError("Failed to test connection. Please try again.")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const handleSaveAndTest = () => {
    if (!apiKey.trim()) {
      setError("Please enter your Groq API key")
      return
    }

    if (!apiKey.startsWith("gsk_")) {
      setError("Invalid Groq API key format. Must start with 'gsk_'")
      return
    }

    testConnection(apiKey)
  }

  const handleReset = () => {
    setIsConnected(false)
    setApiKey("")
    localStorage.removeItem("groq_api_key")
    setError("")
  }

  const maskApiKey = (key: string) => {
    if (key.length < 12) return key
    return key.substring(0, 8) + "..." + key.substring(key.length - 8)
  }

  if (isInitializing) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Initializing Groq connection...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Groq AI Setup (Free)
        </CardTitle>
        <CardDescription>Configure your free Groq API key for ultra-fast AI code generation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Groq API Key
              </label>
              <Input
                type="password"
                placeholder="gsk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                Get your free API key from{" "}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Groq Console
                </a>{" "}
                (14,400 requests/day free)
              </p>
            </div>

            <Button onClick={handleSaveAndTest} disabled={!apiKey.trim() || isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save & Test Connection
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
                <div>
                  <div className="font-medium">Groq API Active</div>
                  <div className="text-sm text-muted-foreground font-mono">{maskApiKey(apiKey)}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Change Key
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">Daily Limit</div>
                <div className="text-muted-foreground">14,400 requests</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">Speed</div>
                <div className="text-muted-foreground">Ultra-fast (&lt;1s)</div>
              </div>
            </div>

            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                🎉 <strong>Groq is ready!</strong> You can now generate React components with lightning-fast AI. Try the
                "Generate Component" tab above.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
