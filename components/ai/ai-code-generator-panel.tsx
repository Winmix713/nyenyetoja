"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { openaiService } from "@/services/openai-service"
import { Wand2, Lightbulb, Loader2, Copy, Download } from "lucide-react"

export function AICodeGeneratorPanel() {
  const [componentName, setComponentName] = useState("")
  const [requirements, setRequirements] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("generate")

  const handleGenerate = async () => {
    if (!componentName.trim() || !requirements.trim()) {
      setError("Please provide both component name and requirements")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await openaiService.generateReactComponent(componentName, requirements)

      setGeneratedCode(result.code)
      setActiveTab("code")

      // Generate suggestions for the code
      const codeSuggestions = await openaiService.generateSuggestions(result.code)
      setSuggestions(codeSuggestions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptimize = async (type: "performance" | "accessibility" | "maintainability") => {
    if (!generatedCode) return

    setIsLoading(true)
    try {
      const optimized = await openaiService.optimizeCode(generatedCode, type)
      setGeneratedCode(optimized)

      // Regenerate suggestions
      const newSuggestions = await openaiService.generateSuggestions(optimized)
      setSuggestions(newSuggestions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err)
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
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Code Generator
          </CardTitle>
          <CardDescription>Generate React components using AI based on your requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="code" disabled={!generatedCode}>
                Code
              </TabsTrigger>
              <TabsTrigger value="suggestions" disabled={suggestions.length === 0}>
                Suggestions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Component Name</label>
                <Input
                  placeholder="e.g., UserProfileCard, NavigationMenu"
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Requirements</label>
                <Textarea
                  placeholder="Describe what the component should do, its props, styling, behavior, etc."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || !componentName.trim() || !requirements.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Component...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Component
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Code</h3>
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
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{generatedCode}</code>
                </pre>
              </div>

              <div className="flex gap-2">
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
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                <h3 className="text-lg font-semibold">AI Suggestions</h3>
              </div>

              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
