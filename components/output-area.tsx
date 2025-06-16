"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Code, Download, Copy, Eye, Palette, CheckCircle, ExternalLink } from "lucide-react"
import { JSXPreview } from "./jsx-preview"
import { ExportPanel } from "./export-panel"
import { NodeRenderer } from "./node-renderer"

interface OutputData {
  figmaData?: any
  jsx: string
  css: string
  figmaCss: string
  figmaUrl: string
}

interface OutputAreaProps {
  output: OutputData
  onReset: () => void
}

export function OutputArea({ output, onReset }: OutputAreaProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null)

  const copyToClipboard = async (text: string, tabName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTab(tabName)
      setTimeout(() => setCopiedTab(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const combinedCSS = `${output.css}\n\n/* Figma Generated Styles */\n${output.figmaCss}`.trim()

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Konvertálás Eredménye</h2>
            <p className="text-gray-400">A generált React komponens és stílusok</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-green-900/30 text-green-300 border-green-800/50">
              <CheckCircle className="w-3 h-3 mr-1" />
              Kész
            </Badge>
            <Button onClick={onReset} variant="outline" size="sm">
              Új Konvertálás
            </Button>
          </div>
        </div>

        {/* Source Info */}
        <div className="mb-6 p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-4 h-4 text-blue-400" />
            <span className="text-white font-semibold">Forrás Figma File</span>
          </div>
          <p className="text-gray-400 text-sm break-all">{output.figmaUrl}</p>
          {output.figmaData && (
            <p className="text-green-400 text-xs mt-1">
              ✅ {output.figmaData.name} - {new Date(output.figmaData.lastModified).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Code Tabs */}
        <Tabs defaultValue="jsx" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="jsx" className="data-[state=active]:bg-gray-700">
              <Code className="w-4 h-4 mr-2" />
              JSX Komponens
            </TabsTrigger>
            <TabsTrigger value="css" className="data-[state=active]:bg-gray-700">
              <Palette className="w-4 h-4 mr-2" />
              CSS Stílusok
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-gray-700">
              <Eye className="w-4 h-4 mr-2" />
              Előnézet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jsx" className="space-y-4">
            <JSXPreview
              jsxCode={output.jsx}
              cssCode={combinedCSS}
              onCodeChange={(code) => {
                // Handle code changes if needed
              }}
            />
          </TabsContent>

          <TabsContent value="css" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">CSS Stílusok</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(combinedCSS, "css")}
                  className="text-gray-300 hover:text-white"
                >
                  {copiedTab === "css" ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiedTab === "css" ? "Másolva!" : "Másolás"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadFile(combinedCSS, "styles.css", "text/css")}
                  className="text-gray-300 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Letöltés
                </Button>
              </div>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 overflow-auto">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                {combinedCSS || "/* Nincs CSS kód generálva */"}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {output.figmaData && (
              <NodeRenderer
                nodes={output.figmaData.nodes || []}
                onNodeSelect={(node) => console.log("Selected node:", node)}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Export Panel */}
        <div className="mt-6 pt-6 border-t border-gray-800/50">
          <ExportPanel
            exportData={{
              jsx: output.jsx,
              css: combinedCSS,
              typescript: `export interface ${output.figmaData?.name || "Component"}Props {
  className?: string;
  children?: React.ReactNode;
}`,
              componentName: output.figmaData?.name || "GeneratedComponent",
              figmaUrl: output.figmaUrl,
              metadata: {
                generatedAt: new Date().toISOString(),
                version: "1.0.0",
                figmaFile: output.figmaData?.name || "Unknown",
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
