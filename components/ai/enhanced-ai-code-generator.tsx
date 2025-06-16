"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { enhancedAIService } from "@/services/enhanced-ai-service"
import type { AIProvider } from "@/lib/ai-provider-manager"
import { Wand2, Lightbulb, Loader2, Copy, Download, Zap, DollarSign, CheckCircle, AlertCircle } from "lucide-react"

interface EnhancedAICodeGeneratorProps {
  onComplete?: (result: { jsx: string; css?: string }) => void
}

export function EnhancedAICodeGenerator({ onComplete }: EnhancedAICodeGeneratorProps) {
  const [componentName, setComponentName] = useState("")
  const [requirements, setRequirements] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("generate")
  const [lastUsedProvider, setLastUsedProvider] = useState<AIProvider | null>(null)
  const [lastUsedModel, setLastUsedModel] = useState<string | null>(null)

  const handleGenerate = async (preferredProvider?: AIProvider) => {
    if (!componentName.trim() || !requirements.trim()) {
      setError("Please provide both component name and requirements")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await enhancedAIService.generateReactComponent(componentName, requirements, undefined, {
        provider: preferredProvider,
      })

      setGeneratedCode(result.code)
      setLastUsedProvider(result.usedProvider)
      setLastUsedModel(result.usedModel)
      setActiveTab("code")
      setSuccess(`Component generated successfully using ${result.usedProvider.toUpperCase()}!`)

      // Generate suggestions for the code
      try {
        const suggestionResult = await enhancedAIService.generateSuggestions(result.code, {
          provider: "groq", // Always use free provider for suggestions
        })
        setSuggestions(suggestionResult.suggestions)
      } catch (suggErr) {
        console.warn("Failed to generate suggestions:", suggErr)
      }

      // Call onComplete callback
      if (onComplete) {
        onComplete({ jsx: result.code })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptimize = async (type: "performance" | "accessibility" | "maintainability") => {
    if (!generatedCode) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await enhancedAIService.optimizeCode(generatedCode, type, {
        provider: "groq", // Use free provider for optimization
      })
      setGeneratedCode(result.code)
      setLastUsedProvider(result.usedProvider)
      setLastUsedModel(result.usedModel)
      setSuccess(`Code optimized for ${type} using ${result.usedProvider.toUpperCase()}!`)

      // Regenerate suggestions
      try {
        const suggestionResult = await enhancedAIService.generateSuggestions(result.code, {
          provider: "groq",
        })
        setSuggestions(suggestionResult.suggestions)
      } catch (suggErr) {
        console.warn("Failed to regenerate suggestions:", suggErr)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setSuccess("Code copied to clipboard!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to copy code")
    }
  }

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: "text/typescript" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${componentName || "component"}.tsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setSuccess("Code downloaded successfully!")
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <div className="w-full max-w-6xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Code Generator
          </CardTitle>
          <CardDescription>
            Generate React components using AI with automatic fallback between providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="code" disabled={!generatedCode}>
                Code
              </TabsTrigger>
              <TabsTrigger value="suggestions" disabled={suggestions.length === 0}>
                Suggestions ({suggestions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Component Name</label>
                <Input
                  placeholder="e.g., UserProfileCard, NavigationMenu, ProductCard"
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Requirements</label>
                <Textarea
                  placeholder="Describe what the component should do, its props, styling, behavior, etc.&#10;&#10;Example:&#10;- A user profile card with avatar, name, and bio&#10;- Should be responsive and use Tailwind CSS&#10;- Include hover effects and proper accessibility"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={() => handleGenerate("groq")}
                  disabled={isLoading || !componentName.trim() || !requirements.trim()}
                  className="w-full"
                  variant="default"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate with Groq (Free)
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleGenerate("openai")}
                  disabled={isLoading || !componentName.trim() || !requirements.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Generate with OpenAI (Premium)
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Generated Code</h3>
                  {lastUsedProvider && (
                    <Badge variant={lastUsedProvider === "groq" ? "default" : "secondary"}>
                      {lastUsedProvider === "groq" ? "Groq" : "OpenAI"} - {lastUsedModel}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCode}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96 border">
                  <code>{generatedCode}</code>
                </pre>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOptimize("performance")} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Optimize Performance
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOptimize("accessibility")}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Improve Accessibility
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOptimize("maintainability")}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Enhance Maintainability
                </Button>
              </div>

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                <h3 className="text-lg font-semibold">AI Suggestions</h3>
                <Badge variant="outline">Powered by Groq (Free)</Badge>
              </div>

              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg border">
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>

              {suggestions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No suggestions available yet. Generate code first to see AI recommendations.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
