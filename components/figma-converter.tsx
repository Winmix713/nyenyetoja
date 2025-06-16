"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Library, Wand2, Settings, Zap, Download, Github } from "lucide-react"
import { MultiStepWizard } from "./multi-step-wizard"
import { OutputArea } from "./output-area"
import { TemplateIntegration } from "./template-integration"
import { FigmaIntegrationPanel } from "./figma/figma-integration-panel"
import { AIProviderSelector } from "./ai/ai-provider-selector"
import { EnhancedAICodeGenerator } from "./ai/enhanced-ai-code-generator"
import { AICostDashboard } from "./ai/ai-cost-dashboard"
import type { ComponentTemplate } from "@/lib/component-templates"
import { Button } from "@/components/ui/button"
import { EnhancedExportWizard } from "./export/enhanced-export-wizard"
import { ExportPresetsSelector } from "./export/export-presets-selector"
import { ExportPresetService, type ExportPreset } from "@/lib/export-presets"

interface OutputData {
  figmaData?: any
  jsx: string
  css: string
  figmaCss: string
  figmaUrl: string
}

export default function FigmaConverter() {
  const [output, setOutput] = useState<OutputData | null>(null)
  const [showOutput, setShowOutput] = useState(false)
  const [activeTab, setActiveTab] = useState<"figma" | "converter" | "ai-generator" | "templates" | "settings">("figma")
  const [selectedExportPreset, setSelectedExportPreset] = useState<ExportPreset | null>(null)
  const [showExportWizard, setShowExportWizard] = useState(false)
  const [exportMethod, setExportMethod] = useState<"quick" | "advanced">("quick")

  const handleWizardComplete = (result: OutputData) => {
    setOutput(result)
    setShowOutput(true)
    console.log("🎉 Conversion completed:", result)
  }

  const handleFigmaComplete = (result: OutputData) => {
    setOutput(result)
    setShowOutput(true)
    setActiveTab("converter")
    console.log("🎉 Figma processing completed:", result)
  }

  const handleAIComplete = (result: { jsx: string; css?: string }) => {
    const aiOutput: OutputData = {
      jsx: result.jsx,
      css: result.css || "",
      figmaCss: "",
      figmaUrl: "",
      figmaData: {
        name: "AI Generated Component",
        lastModified: new Date().toISOString(),
        source: "AI Generator",
      },
    }
    setOutput(aiOutput)
    setShowOutput(true)
    console.log("🤖 AI generation completed:", aiOutput)
  }

  const handleReset = () => {
    setOutput(null)
    setShowOutput(false)
    setActiveTab("figma")
  }

  const handleTemplateSelect = (template: ComponentTemplate) => {
    const templateOutput: OutputData = {
      jsx: template.jsx,
      css: template.css,
      figmaCss: "",
      figmaUrl: template.figmaUrl || "",
      figmaData: {
        name: template.name,
        lastModified: template.createdAt,
      },
    }

    setOutput(templateOutput)
    setShowOutput(true)
    setActiveTab("converter")

    console.log("✅ Template applied:", template.name)
  }

  const handleQuickExport = async (method: "zip" | "github") => {
    if (!output) return

    const defaultPreset = ExportPresetService.getPreset("react-starter")
    if (!defaultPreset) return

    try {
      if (method === "zip") {
        // Quick ZIP export
        console.log("🚀 Quick ZIP export started with React Starter preset")
        // Export logic would be called here
      } else {
        // Quick GitHub export
        console.log("🚀 Quick GitHub export started with React Starter preset")
        // GitHub export logic would be called here
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const handleAdvancedExport = () => {
    setShowExportWizard(true)
  }

  const handleExportComplete = (result: string) => {
    console.log("✅ Export completed:", result)
    setShowExportWizard(false)
    // Show success notification
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
      {showOutput && output && !showExportWizard ? (
        <div className="w-full max-w-7xl space-y-6">
          {/* Export Quick Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">🎉 Component Ready!</h3>
                <p className="text-sm text-gray-600">Your component has been generated and is ready to export</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setExportMethod("quick")}
                  variant={exportMethod === "quick" ? "default" : "outline"}
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Export
                </Button>
                <Button
                  onClick={() => setExportMethod("advanced")}
                  variant={exportMethod === "advanced" ? "default" : "outline"}
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </div>

            {exportMethod === "quick" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleQuickExport("zip")}
                  className="flex items-center justify-center space-x-2 h-12"
                  variant="outline"
                >
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Download ZIP</div>
                    <div className="text-xs text-muted-foreground">React + Tailwind + TypeScript</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleQuickExport("github")}
                  className="flex items-center justify-center space-x-2 h-12"
                  variant="outline"
                >
                  <Github className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Push to GitHub</div>
                    <div className="text-xs text-muted-foreground">Create new repository</div>
                  </div>
                </Button>
              </div>
            )}

            {exportMethod === "advanced" && (
              <div className="space-y-4">
                <ExportPresetsSelector onPresetSelect={setSelectedExportPreset} selectedPreset={selectedExportPreset} />

                <div className="flex justify-end">
                  <Button
                    onClick={handleAdvancedExport}
                    disabled={!selectedExportPreset}
                    className="flex items-center space-x-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Start Advanced Export</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <OutputArea output={output} onReset={handleReset} />
        </div>
      ) : showExportWizard && output ? (
        <div className="w-full max-w-4xl">
          <EnhancedExportWizard
            component={output}
            selectedPreset={selectedExportPreset}
            onComplete={handleExportComplete}
            onCancel={() => setShowExportWizard(false)}
          />
        </div>
      ) : (
        // Original tabs content
        <div className="w-full max-w-7xl">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-4xl grid-cols-5">
                <TabsTrigger value="figma" className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.332 8.668a3.333 3.333 0 0 0 0-6.663H8.668a3.333 3.333 0 0 0 0 6.663 3.333 3.333 0 0 0 0 6.665 3.333 3.333 0 1 0 3.332-3.332V8.668Z" />
                    <circle cx="15.332" cy="12" r="3.332" />
                  </svg>
                  Figma Import
                </TabsTrigger>
                <TabsTrigger value="ai-generator" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  AI Generator
                </TabsTrigger>
                <TabsTrigger value="converter" className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Manual Convert
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <Library className="w-4 h-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  AI Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="figma" className="mt-0">
              <div className="flex justify-center">
                <FigmaIntegrationPanel onComplete={handleFigmaComplete} />
              </div>
            </TabsContent>

            <TabsContent value="ai-generator" className="mt-0">
              <div className="flex justify-center">
                <EnhancedAICodeGenerator onComplete={handleAIComplete} />
              </div>
            </TabsContent>

            <TabsContent value="converter" className="mt-0">
              <div className="flex justify-center">
                <MultiStepWizard onComplete={handleWizardComplete} />
              </div>
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <TemplateIntegration onTemplateSelect={handleTemplateSelect} />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <div className="space-y-6">
                <AIProviderSelector />
                <AICostDashboard />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
