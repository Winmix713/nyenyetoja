"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Code, Library, ArrowRight } from "lucide-react"
import { AITemplateRecommendations } from "./ai-template-recommendations"
import { TemplateLibrary } from "./template-library"
import { useAIRecommendations } from "@/hooks/use-ai-recommendations"
import type { ComponentTemplate } from "@/lib/component-templates"
import type { WizardState } from "@/hooks/use-wizard-state"

interface EnhancedWizardStep2Props {
  wizardState: WizardState
  onTemplateSelect: (template: ComponentTemplate) => void
  onContinueWithoutTemplate: () => void
}

export function EnhancedWizardStep2({
  wizardState,
  onTemplateSelect,
  onContinueWithoutTemplate,
}: EnhancedWizardStep2Props) {
  const [activeTab, setActiveTab] = useState<"ai" | "browse" | "custom">("ai")
  const [selectedTemplate, setSelectedTemplate] = useState<ComponentTemplate | null>(null)

  const { recommendations, isAnalyzing, analyzeDesign, selectTemplate } = useAIRecommendations({
    onTemplateSelect: (template) => {
      setSelectedTemplate(template)
      onTemplateSelect(template)
    },
  })

  // Auto-analyze when figma data is available
  React.useEffect(() => {
    if (wizardState.figmaData && !recommendations && !isAnalyzing) {
      analyzeDesign(wizardState.figmaData.nodes || [], wizardState.figmaData, {
        projectType: "web-application", // Could be user input
        industry: "technology", // Could be user input
      })
    }
  }, [wizardState.figmaData, recommendations, isAnalyzing, analyzeDesign])

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-3">Choose Your Starting Point</h3>
        <p className="text-gray-400">Let AI recommend the perfect template or browse our library</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="ai" className="flex items-center gap-2 data-[state=active]:bg-gray-700">
            <Sparkles className="w-4 h-4" />
            AI Recommendations
            {recommendations?.primaryMatches.length && (
              <Badge variant="secondary" className="ml-1 bg-blue-900/30 text-blue-300">
                {recommendations.primaryMatches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2 data-[state=active]:bg-gray-700">
            <Library className="w-4 h-4" />
            Browse Templates
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2 data-[state=active]:bg-gray-700">
            <Code className="w-4 h-4" />
            Start from Scratch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-6">
          <AITemplateRecommendations
            figmaNodes={wizardState.figmaData?.nodes || []}
            figmaData={wizardState.figmaData}
            userContext={{
              projectType: "web-application",
              industry: "technology",
            }}
            onSelectTemplate={selectTemplate}
            onPreviewTemplate={(template) => {
              // Handle preview
              console.log("Preview template:", template.name)
            }}
          />
        </TabsContent>

        <TabsContent value="browse" className="mt-6">
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-xl">
            <TemplateLibrary
              onSelectTemplate={selectTemplate}
              onPreviewTemplate={(template) => {
                console.log("Preview template:", template.name)
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-8 backdrop-blur-xl text-center">
            <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Start from Scratch</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Skip templates and let our AI generate completely custom code based on your Figma design
            </p>
            <Button onClick={onContinueWithoutTemplate} className="bg-white text-black hover:bg-gray-100">
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue with Custom Generation
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Template Summary */}
      {selectedTemplate && (
        <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-green-300 font-semibold">Template Selected</h4>
              <p className="text-green-200 text-sm">{selectedTemplate.name}</p>
            </div>
            <Badge className="bg-green-800/50 text-green-200">Ready to proceed</Badge>
          </div>
        </div>
      )}
    </div>
  )
}
