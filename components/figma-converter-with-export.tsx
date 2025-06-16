"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, Github, Settings, History, Zap } from "lucide-react"
import { ExportService } from "@/services/export-service"
import { ExportWizard } from "@/components/export/export-wizard"
import { ExportHistory } from "@/components/export/export-history"

interface GeneratedComponent {
  jsx: string
  css: string
  typescript: string
  componentName: string
  figmaUrl: string
}

export default function FigmaConverterWithExport() {
  const [generatedComponent, setGeneratedComponent] = useState<GeneratedComponent | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)
  const [showExportWizard, setShowExportWizard] = useState(false)
  const [showExportHistory, setShowExportHistory] = useState(false)

  const handleQuickZipExport = async () => {
    if (!generatedComponent) return

    setIsExporting(true)
    try {
      await ExportService.createZipDownload({
        ...generatedComponent,
        metadata: {
          generatedAt: new Date().toISOString(),
          version: "1.0.0",
          figmaFile: generatedComponent.figmaUrl,
        },
      })
      setExportSuccess("ZIP downloaded successfully!")
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleGitHubExport = async () => {
    if (!generatedComponent) return

    const token = localStorage.getItem("github_token")
    if (!token) {
      alert("Please set your GitHub token first")
      return
    }

    setIsExporting(true)
    try {
      const repoUrl = await ExportService.pushToGitHub(
        {
          ...generatedComponent,
          metadata: {
            generatedAt: new Date().toISOString(),
            version: "1.0.0",
            figmaFile: generatedComponent.figmaUrl,
          },
        },
        `${generatedComponent.componentName.toLowerCase()}-component`,
        token,
      )
      setExportSuccess(`Repository created: ${repoUrl}`)
    } catch (error) {
      console.error("GitHub export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Export Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Figma to React Converter</CardTitle>
                <p className="text-muted-foreground">Convert Figma designs to production-ready React components</p>
              </div>

              {generatedComponent && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Zap className="w-3 h-3 mr-1" />
                    Component Ready
                  </Badge>

                  <div className="flex gap-2">
                    <Button onClick={handleQuickZipExport} disabled={isExporting} size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {isExporting ? "Exporting..." : "Quick ZIP"}
                    </Button>

                    <Button onClick={handleGitHubExport} disabled={isExporting} size="sm" variant="outline">
                      <Github className="w-4 h-4 mr-2" />
                      {isExporting ? "Creating..." : "GitHub"}
                    </Button>

                    <Button onClick={() => setShowExportWizard(true)} size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Advanced Export
                    </Button>

                    <Button onClick={() => setShowExportHistory(true)} size="sm" variant="ghost">
                      <History className="w-4 h-4 mr-2" />
                      History
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Success Message */}
        {exportSuccess && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800">
                <Zap className="w-5 h-5" />
                <span className="font-medium">{exportSuccess}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="converter" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="converter">Converter</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="export">Export Options</TabsTrigger>
            <TabsTrigger value="history">Export History</TabsTrigger>
          </TabsList>

          <TabsContent value="converter" className="space-y-4">
            {/* Figma Converter Component would go here */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Figma converter interface would be integrated here</p>
                  <Button
                    onClick={() =>
                      setGeneratedComponent({
                        jsx: "export default function MyComponent() { return <div>Hello World</div> }",
                        css: ".my-component { color: blue; }",
                        typescript: "export interface MyComponentProps {}",
                        componentName: "MyComponent",
                        figmaUrl: "https://figma.com/file/example",
                      })
                    }
                    className="mt-4"
                  >
                    Simulate Component Generation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {generatedComponent ? (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Component Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">JSX Code:</h4>
                      <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{generatedComponent.jsx}</pre>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">CSS Styles:</h4>
                      <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{generatedComponent.css}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No component generated yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            {generatedComponent ? (
              <ExportWizard component={generatedComponent} onExportComplete={(result) => setExportSuccess(result)} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Generate a component first to see export options</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ExportHistory />
          </TabsContent>
        </Tabs>

        {/* Export Wizard Modal */}
        {showExportWizard && generatedComponent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Advanced Export Options</h2>
                <Button variant="ghost" onClick={() => setShowExportWizard(false)}>
                  ✕
                </Button>
              </div>
              <ExportWizard
                component={generatedComponent}
                onExportComplete={(result) => {
                  setExportSuccess(result)
                  setShowExportWizard(false)
                }}
              />
            </div>
          </div>
        )}

        {/* Export History Modal */}
        {showExportHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Export History</h2>
                <Button variant="ghost" onClick={() => setShowExportHistory(false)}>
                  ✕
                </Button>
              </div>
              <ExportHistory />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
