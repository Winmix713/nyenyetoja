"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Github, CheckCircle, AlertTriangle, Loader2, ExternalLink, Copy, Check } from "lucide-react"
import { ExportPresetsSelector } from "./export-presets-selector"
import { EnhancedExportService, type ExportProgress, type GeneratedComponent } from "@/services/enhanced-export-service"
import type { ExportPreset } from "@/lib/export-presets"
import { EnhancedErrorBoundary } from "@/components/enhanced-error-boundary"

interface EnhancedExportWizardProps {
  component: GeneratedComponent
  onExportComplete: (result: string) => void
}

export function EnhancedExportWizard({ component, onExportComplete }: EnhancedExportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>()
  const [exportMethod, setExportMethod] = useState<"zip" | "github">()
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    currentStep: "",
    progress: 0,
    totalSteps: 0,
    errors: [],
  })
  const [exportResult, setExportResult] = useState<string>()
  const [copied, setCopied] = useState(false)

  const steps = [
    { id: 1, title: "Choose Preset", description: "Select export configuration" },
    { id: 2, title: "Export Method", description: "ZIP download or GitHub" },
    { id: 3, title: "Export", description: "Generate your project" },
    { id: 4, title: "Complete", description: "Download or view result" },
  ]

  // Setup progress callback
  const handleProgressUpdate = useCallback((progress: ExportProgress) => {
    setExportProgress(progress)
  }, [])

  const handleExport = async (method: "zip" | "github") => {
    if (!selectedPreset) return

    setIsExporting(true)
    setExportMethod(method)
    setCurrentStep(3)

    try {
      // Setup progress tracking
      EnhancedExportService.setProgressCallback(handleProgressUpdate)

      let result: string

      if (method === "zip") {
        await EnhancedExportService.createZipExport(component, selectedPreset)
        result = `${component.componentName}.zip downloaded successfully!`
      } else {
        const githubToken = localStorage.getItem("github_token")
        if (!githubToken) {
          throw new Error("GitHub token not found. Please connect your GitHub account first.")
        }

        const repoUrl = await EnhancedExportService.createGitHubExport(component, selectedPreset)
        result = repoUrl
      }

      setExportResult(result)
      setCurrentStep(4)
      onExportComplete(result)
    } catch (error) {
      console.error("Export failed:", error)
      setExportProgress((prev) => ({
        ...prev,
        errors: [...prev.errors, `Export failed: ${error}`],
      }))
    } finally {
      setIsExporting(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setSelectedPreset(undefined)
    setExportMethod(undefined)
    setIsExporting(false)
    setExportProgress({
      currentStep: "",
      progress: 0,
      totalSteps: 0,
      errors: [],
    })
    setExportResult(undefined)
    setCopied(false)
  }

  return (
    <EnhancedErrorBoundary>
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex flex-col items-center ${currentStep >= step.id ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep - 1]?.title}
              {selectedPreset && currentStep === 1 && <Badge variant="secondary">{selectedPreset.name}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Choose Preset */}
            {currentStep === 1 && (
              <ExportPresetsSelector onPresetSelect={setSelectedPreset} selectedPreset={selectedPreset} />
            )}

            {/* Step 2: Export Method */}
            {currentStep === 2 && selectedPreset && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Choose Export Method</h3>
                  <p className="text-muted-foreground">
                    How would you like to export your {selectedPreset.name} project?
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
                    onClick={() => handleExport("zip")}
                  >
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <Download className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Download ZIP</h3>
                          <p className="text-muted-foreground text-sm">Get a complete project as a ZIP file</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Instant download
                          </div>
                          <div className="flex items-center justify-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Works offline
                          </div>
                          <div className="flex items-center justify-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            No account needed
                          </div>
                        </div>
                        <Button className="w-full" disabled={isExporting}>
                          {isExporting && exportMethod === "zip" ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating ZIP...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download ZIP
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-gray-300"
                    onClick={() => handleExport("github")}
                  >
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Github className="w-8 h-8 text-gray-800" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Push to GitHub</h3>
                          <p className="text-muted-foreground text-sm">Create a new repository on GitHub</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Version control ready
                          </div>
                          <div className="flex items-center justify-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            GitHub Actions included
                          </div>
                          <div className="flex items-center justify-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Collaboration ready
                          </div>
                        </div>
                        <Button className="w-full" disabled={isExporting}>
                          {isExporting && exportMethod === "github" ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating Repository...
                            </>
                          ) : (
                            <>
                              <Github className="w-4 h-4 mr-2" />
                              Create Repository
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Preset Summary */}
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-3">Export Configuration</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Framework:</span>
                        <div className="font-medium">{selectedPreset.framework}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Styling:</span>
                        <div className="font-medium">{selectedPreset.styling}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">TypeScript:</span>
                        <div className="font-medium">{selectedPreset.typescript ? "Yes" : "No"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tests:</span>
                        <div className="font-medium">{selectedPreset.includeTests ? "Included" : "No"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Export Progress */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">
                    {exportMethod === "zip" ? "Generating ZIP File" : "Creating GitHub Repository"}
                  </h3>
                  <p className="text-muted-foreground">Please wait while we prepare your project...</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{exportProgress.currentStep || "Initializing..."}</span>
                    <span>{Math.round(exportProgress.progress)}%</span>
                  </div>
                  <Progress value={exportProgress.progress} className="w-full" />
                  {exportProgress.currentComponent && (
                    <p className="text-xs text-muted-foreground text-center">
                      Processing: {exportProgress.currentComponent}
                    </p>
                  )}
                </div>

                {/* Export Steps */}
                <div className="space-y-2">
                  {[
                    "Preparing project structure",
                    "Generating component files",
                    "Creating configuration files",
                    selectedPreset?.includeTests && "Setting up tests",
                    selectedPreset?.includeStorybook && "Configuring Storybook",
                    exportMethod === "github" && "Uploading to GitHub",
                    exportMethod === "zip" && "Compressing files",
                    "Finalizing export",
                  ]
                    .filter(Boolean)
                    .map((step, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        {exportProgress.progress > (index / 8) * 100 ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : exportProgress.progress > ((index - 1) / 8) * 100 ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span
                          className={
                            exportProgress.progress > (index / 8) * 100
                              ? "text-green-600"
                              : exportProgress.progress > ((index - 1) / 8) * 100
                                ? "text-blue-600"
                                : "text-gray-400"
                          }
                        >
                          {step}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Errors */}
                {exportProgress.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {exportProgress.errors.map((error, index) => (
                          <div key={index}>{error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && exportResult && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Export Complete!</h3>
                  <p className="text-muted-foreground">
                    Your {selectedPreset?.name} project has been successfully exported.
                  </p>
                </div>

                {/* Result */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    {exportMethod === "github" ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Repository URL:</span>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(exportResult)}>
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => window.open(exportResult, "_blank")}>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border font-mono text-sm break-all">{exportResult}</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-green-800 font-medium">{exportResult}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {exportMethod === "github" ? (
                      <>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-blue-600">1</span>
                          </div>
                          <div>
                            <p className="font-medium">Clone the repository</p>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">git clone {exportResult}.git</code>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-blue-600">2</span>
                          </div>
                          <div>
                            <p className="font-medium">Install dependencies</p>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {selectedPreset?.packageManager} install
                            </code>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-blue-600">3</span>
                          </div>
                          <div>
                            <p className="font-medium">Start development</p>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {selectedPreset?.packageManager} run dev
                            </code>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-blue-600">1</span>
                          </div>
                          <div>
                            <p className="font-medium">Extract the ZIP file</p>
                            <p className="text-sm text-muted-foreground">
                              Unzip the downloaded file to your desired location
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-blue-600">2</span>
                          </div>
                          <div>
                            <p className="font-medium">Install dependencies</p>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {selectedPreset?.packageManager} install
                            </code>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-blue-600">3</span>
                          </div>
                          <div>
                            <p className="font-medium">Start development</p>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {selectedPreset?.packageManager} run dev
                            </code>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-center space-x-3">
                  <Button onClick={resetWizard} variant="outline">
                    Export Another Component
                  </Button>
                  {exportMethod === "github" && (
                    <Button onClick={() => window.open(exportResult, "_blank")}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Repository
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < 3 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || isExporting}
            >
              Previous
            </Button>

            {currentStep === 1 && selectedPreset && (
              <Button onClick={() => setCurrentStep(2)}>Continue with {selectedPreset.name}</Button>
            )}
          </div>
        )}
      </div>
    </EnhancedErrorBoundary>
  )
}
