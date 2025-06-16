"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { validateOpenAIKey, testOpenAIConnection } from "@/lib/openai-client"
import { aiCostManager } from "@/lib/ai-cost-manager"
import { Key, DollarSign, Activity, CheckCircle, XCircle, Loader2 } from "lucide-react"

export function OpenAISetup() {
  const [apiKey, setApiKey] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [usageReport, setUsageReport] = useState<any>(null)

  useEffect(() => {
    // Load existing API key
    const stored = localStorage.getItem("openai_api_key")
    if (stored) {
      setApiKey(stored)
      setIsValid(validateOpenAIKey(stored))
      checkConnection(stored)
    }

    // Load usage report
    setUsageReport(aiCostManager.getUsageReport())
  }, [])

  const checkConnection = async (key: string) => {
    if (!validateOpenAIKey(key)) return

    setIsLoading(true)
    try {
      const connected = await testOpenAIConnection(key)
      setIsConnected(connected)
      if (!connected) {
        setError("Failed to connect to OpenAI. Please check your API key.")
      } else {
        setError("")
      }
    } catch (err) {
      setIsConnected(false)
      setError("Connection test failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveKey = async () => {
    if (!validateOpenAIKey(apiKey)) {
      setError('Invalid API key format. Must start with "sk-" and be at least 20 characters.')
      return
    }

    localStorage.setItem("openai_api_key", apiKey)
    setIsValid(true)
    await checkConnection(apiKey)
  }

  const handleRemoveKey = () => {
    localStorage.removeItem("openai_api_key")
    setApiKey("")
    setIsValid(false)
    setIsConnected(false)
    setError("")
  }

  const maskApiKey = (key: string) => {
    if (key.length < 8) return key
    return key.substring(0, 7) + "..." + key.substring(key.length - 4)
  }

  return (
    <div className="space-y-6">
      {/* API Key Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Setup
          </CardTitle>
          <CardDescription>Configure your OpenAI API key to enable AI-powered code generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isValid ? (
            <div className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="sk-proj-... or sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Get your API key from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>

              <Button onClick={handleSaveKey} disabled={!apiKey || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  "Save & Test API Key"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <code className="text-sm">{maskApiKey(apiKey)}</code>
                  {isConnected ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      Disconnected
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleRemoveKey}>
                  Remove
                </Button>
              </div>

              {!isConnected && (
                <Button
                  variant="outline"
                  onClick={() => checkConnection(apiKey)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Usage Dashboard */}
      {isValid && usageReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Usage & Costs
            </CardTitle>
            <CardDescription>Monitor your OpenAI API usage and costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">${usageReport.daily.cost.toFixed(3)}</div>
                <div className="text-sm text-muted-foreground">Today</div>
                <div className="text-xs text-muted-foreground">{usageReport.daily.tokens.toLocaleString()} tokens</div>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">${usageReport.monthly.cost.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">This Month</div>
                <div className="text-xs text-muted-foreground">
                  {usageReport.monthly.tokens.toLocaleString()} tokens
                </div>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{usageReport.total.requests}</div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
                <div className="text-xs text-muted-foreground">${usageReport.total.cost.toFixed(2)} lifetime</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Cost Limits</span>
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                Daily: ${usageReport.limits.daily} | Monthly: ${usageReport.limits.monthly}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
