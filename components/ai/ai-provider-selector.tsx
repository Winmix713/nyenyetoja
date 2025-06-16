"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { aiProviderManager, type AIProvider } from "@/lib/ai-provider-manager"
import { testGroqConnection } from "@/lib/groq-client"
import { testOpenAIConnection } from "@/lib/openai-client"
import { Zap, DollarSign, Clock, CheckCircle, XCircle, Loader2, Key, Settings } from "lucide-react"

export function AIProviderSelector() {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("groq")
  const [selectedModel, setSelectedModel] = useState("")
  const [groqKey, setGroqKey] = useState("")
  const [openaiKey, setOpenaiKey] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<Record<AIProvider, boolean>>({
    groq: false,
    openai: false,
  })
  const [isLoading, setIsLoading] = useState<Record<AIProvider, boolean>>({
    groq: false,
    openai: false,
  })
  const [error, setError] = useState("")

  const providers = aiProviderManager.getAvailableProviders()

  useEffect(() => {
    // Auto-initialize with Groq key if provided
    const initializeProviders = async () => {
      // Check for stored keys
      const storedGroqKey = localStorage.getItem("groq_api_key")
      const storedOpenAIKey = localStorage.getItem("openai_api_key")
      const storedProvider = localStorage.getItem("preferred_ai_provider") as AIProvider

      // Auto-set Groq key if not stored
      const defaultGroqKey = "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"

      if (!storedGroqKey) {
        setGroqKey(defaultGroqKey)
        localStorage.setItem("groq_api_key", defaultGroqKey)
        await testConnection("groq", defaultGroqKey)
      } else {
        setGroqKey(storedGroqKey)
        await testConnection("groq", storedGroqKey)
      }

      if (storedOpenAIKey) {
        setOpenaiKey(storedOpenAIKey)
        await testConnection("openai", storedOpenAIKey)
      }

      if (storedProvider) {
        setSelectedProvider(storedProvider)
        aiProviderManager.setDefaultProvider(storedProvider)
      }

      // Set default model
      const defaultProvider = providers.find((p) => p.id === (storedProvider || "groq"))
      if (defaultProvider && defaultProvider.models.length > 0) {
        setSelectedModel(defaultProvider.models[0].id)
      }
    }

    initializeProviders()
  }, [])

  const testConnection = async (provider: AIProvider, key: string) => {
    setIsLoading((prev) => ({ ...prev, [provider]: true }))

    try {
      let isConnected = false

      if (provider === "groq") {
        isConnected = await testGroqConnection(key)
      } else if (provider === "openai") {
        isConnected = await testOpenAIConnection(key)
      }

      setConnectionStatus((prev) => ({ ...prev, [provider]: isConnected }))

      if (!isConnected) {
        setError(`Failed to connect to ${provider.toUpperCase()}. Please check your API key.`)
      } else {
        setError("")
      }
    } catch (err) {
      setConnectionStatus((prev) => ({ ...prev, [provider]: false }))
      setError(`Connection test failed for ${provider.toUpperCase()}.`)
    } finally {
      setIsLoading((prev) => ({ ...prev, [provider]: false }))
    }
  }

  const handleSaveKey = (provider: AIProvider, key: string) => {
    if (provider === "groq") {
      if (!key.startsWith("gsk_")) {
        setError('Invalid Groq API key format. Must start with "gsk_".')
        return
      }
      localStorage.setItem("groq_api_key", key)
      testConnection("groq", key)
    } else if (provider === "openai") {
      if (!key.startsWith("sk-")) {
        setError('Invalid OpenAI API key format. Must start with "sk-".')
        return
      }
      localStorage.setItem("openai_api_key", key)
      testConnection("openai", key)
    }
  }

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider)
    aiProviderManager.setDefaultProvider(provider)
    localStorage.setItem("preferred_ai_provider", provider)

    // Reset model selection
    const providerData = providers.find((p) => p.id === provider)
    if (providerData && providerData.models.length > 0) {
      setSelectedModel(providerData.models[0].id)
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length < 8) return key
    return key.substring(0, 7) + "..." + key.substring(key.length - 4)
  }

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Provider Selection
          </CardTitle>
          <CardDescription>Choose your preferred AI provider and configure API keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedProvider === provider.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleProviderChange(provider.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{provider.name}</h3>
                  <div className="flex gap-2">
                    <Badge variant={provider.cost === "Free" ? "default" : "secondary"}>
                      <DollarSign className="mr-1 h-3 w-3" />
                      {provider.cost}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      {provider.speed}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{provider.description}</p>

                {/* Connection Status */}
                <div className="flex items-center gap-2">
                  {connectionStatus[provider.id] ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Model Selection */}
          {selectedProvider && (
            <div>
              <label className="text-sm font-medium">Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {providers
                    .find((p) => p.id === selectedProvider)
                    ?.models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Key Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Configuration
          </CardTitle>
          <CardDescription>Configure API keys for your selected providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Groq API Key */}
          <div>
            <label className="text-sm font-medium">Groq API Key (Free)</label>
            {!connectionStatus.groq ? (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
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
                  </a>
                </p>
                <Button onClick={() => handleSaveKey("groq", groqKey)} disabled={!groqKey || isLoading.groq} size="sm">
                  {isLoading.groq ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Save & Test"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                  <code className="text-sm">{maskApiKey(groqKey)}</code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConnectionStatus((prev) => ({ ...prev, groq: false }))}
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          {/* OpenAI API Key */}
          <div>
            <label className="text-sm font-medium">OpenAI API Key (Premium)</label>
            {!connectionStatus.openai ? (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
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
                <Button
                  onClick={() => handleSaveKey("openai", openaiKey)}
                  disabled={!openaiKey || isLoading.openai}
                  size="sm"
                >
                  {isLoading.openai ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Save & Test"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                  <code className="text-sm">{maskApiKey(openaiKey)}</code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConnectionStatus((prev) => ({ ...prev, openai: false }))}
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Selection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Current Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Provider</div>
              <div className="text-lg">{providers.find((p) => p.id === selectedProvider)?.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Model</div>
              <div className="text-lg">
                {providers.find((p) => p.id === selectedProvider)?.models.find((m) => m.id === selectedModel)?.name ||
                  "Not selected"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
