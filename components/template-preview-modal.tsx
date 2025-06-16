"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Code, Eye, Download, Copy, Star, User, Calendar, Package, Check } from "lucide-react"
import type { ComponentTemplate } from "@/lib/component-templates"

interface TemplatePreviewModalProps {
  template: ComponentTemplate | null
  isOpen: boolean
  onClose: () => void
  onUseTemplate?: (template: ComponentTemplate) => void
}

export function TemplatePreviewModal({ template, isOpen, onClose, onUseTemplate }: TemplatePreviewModalProps) {
  const [activeTab, setActiveTab] = useState("preview")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  if (!template) return null

  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(type)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">{template.name}</DialogTitle>
                <DialogDescription className="text-gray-600 mb-4">{template.description}</DialogDescription>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {template.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {template.downloads.toLocaleString()} downloads
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    {template.rating}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-6">
                <Badge className={`${getComplexityColor(template.complexity)}`}>{template.complexity}</Badge>
                <Button onClick={() => onUseTemplate?.(template)} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Dependencies */}
            {template.dependencies.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  Dependencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {template.dependencies.map((dep) => (
                    <Badge key={dep} variant="outline" className="text-xs">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-gray-50 m-0 rounded-none">
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="jsx" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  JSX
                </TabsTrigger>
                <TabsTrigger value="css" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  CSS
                </TabsTrigger>
                <TabsTrigger value="typescript" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  TypeScript
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="preview" className="h-full m-0 p-6 overflow-auto">
                  <div className="bg-white border border-gray-200 rounded-lg p-8 min-h-96">
                    <div className="text-center text-gray-500">
                      <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Component Preview</h3>
                      <p className="text-sm">
                        Interactive preview would be rendered here.
                        <br />
                        Use the JSX tab to see the component code.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="jsx" className="h-full m-0 overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">JSX Component</h3>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(template.jsx, "jsx")}>
                        {copiedCode === "jsx" ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex-1 overflow-auto bg-gray-950 text-gray-100">
                      <pre className="p-4 text-sm font-mono whitespace-pre-wrap">{template.jsx}</pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="css" className="h-full m-0 overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">CSS Styles</h3>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(template.css, "css")}>
                        {copiedCode === "css" ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex-1 overflow-auto bg-gray-950 text-gray-100">
                      <pre className="p-4 text-sm font-mono whitespace-pre-wrap">{template.css}</pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="typescript" className="h-full m-0 overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">TypeScript Definitions</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(template.typescript, "typescript")}
                      >
                        {copiedCode === "typescript" ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex-1 overflow-auto bg-gray-950 text-gray-100">
                      <pre className="p-4 text-sm font-mono whitespace-pre-wrap">{template.typescript}</pre>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
