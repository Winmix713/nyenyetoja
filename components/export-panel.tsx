"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Github, Package, ExternalLink, CheckCircle, AlertCircle, Settings } from "lucide-react"
import { EnhancedExportService, type ExportData, type ExportOptions } from "@/services/enhanced-export-service"
import { useSecureStorage } from "@/hooks/use-secure-storage"

interface ExportPanelProps {
  exportData: ExportData
}

export function ExportPanel({ exportData }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  // GitHub export state
  const { value: githubToken, setValue: setGithubToken } = useSecureStorage("github-token")
  const [repoName, setRepoName] = useState(exportData.componentName.toLowerCase())
  const [githubUrl, setGithubUrl] = useState("")

  // Export options
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    framework: "react",
    styling: "tailwind",
    includeTests: false,
    includeStorybook: false,
  })

  const handleZipDownload = async () => {
    setIsExporting(true)
    setExportStatus({ type: null, message: "" })

    try {
      await EnhancedExportService.createZipDownload(exportData, exportOptions)
      setExportStatus({
        type: "success",
        message: "ZIP fájl sikeresen letöltve!",
      })
    } catch (error) {
      setExportStatus({
        type: "error",
        message: `Letöltési hiba: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleGitHubExport = async () => {
    if (!githubToken || !repoName) {
      setExportStatus({
        type: "error",
        message: "GitHub token és repository név megadása kötelező",
      })
      return
    }

    setIsExporting(true)
    setExportStatus({ type: null, message: "" })

    try {
      const url = await EnhancedExportService.pushToGitHub(exportData, repoName, githubToken, exportOptions)
      setGithubUrl(url)
      setExportStatus({
        type: "success",
        message: "Sikeresen feltöltve GitHub-ra!",
      })
    } catch (error) {
      setExportStatus({
        type: "error",
        message: `GitHub export hiba: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Export Opciók</h3>
          <p className="text-gray-400 text-sm">Töltsd le vagy oszd meg a generált komponenst</p>
        </div>
        <Badge variant="secondary" className="bg-blue-900/30 text-blue-300 border-blue-800/50">
          <Package className="w-3 h-3 mr-1" />
          {exportData.componentName}
        </Badge>
      </div>

      {/* Export Options */}
      <div className="mb-6 p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-gray-400" />
          <h4 className="text-white font-semibold">Export Beállítások</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-300 mb-2 block">Framework</Label>
            <Select
              value={exportOptions.framework}
              onValueChange={(value: any) => setExportOptions((prev) => ({ ...prev, framework: value }))}
            >
              <SelectTrigger className="bg-gray-700/50 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="next">Next.js</SelectItem>
                <SelectItem value="vite">Vite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-300 mb-2 block">Styling</Label>
            <Select
              value={exportOptions.styling}
              onValueChange={(value: any) => setExportOptions((prev) => ({ ...prev, styling: value }))}
            >
              <SelectTrigger className="bg-gray-700/50 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                <SelectItem value="styled-components">Styled Components</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tests"
              checked={exportOptions.includeTests}
              onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, includeTests: !!checked }))}
            />
            <Label htmlFor="tests" className="text-sm text-gray-300">
              Tesztek
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="storybook"
              checked={exportOptions.includeStorybook}
              onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, includeStorybook: !!checked }))}
            />
            <Label htmlFor="storybook" className="text-sm text-gray-300">
              Storybook
            </Label>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {exportStatus.type && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            exportStatus.type === "success"
              ? "bg-green-900/20 border-green-800/30 text-green-300"
              : "bg-red-900/20 border-red-800/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {exportStatus.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{exportStatus.message}</span>
          </div>
          {githubUrl && (
            <div className="mt-2">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Repository megtekintése
              </a>
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="zip" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger value="zip" className="data-[state=active]:bg-gray-700">
            <Download className="w-4 h-4 mr-2" />
            ZIP Letöltés
          </TabsTrigger>
          <TabsTrigger value="github" className="data-[state=active]:bg-gray-700">
            <Github className="w-4 h-4 mr-2" />
            GitHub Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zip" className="space-y-4">
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3">Projekt Struktúra</h4>
            <div className="space-y-2 text-sm text-gray-300 font-mono">
              <div>📁 src/</div>
              <div className="ml-4">📁 components/</div>
              <div className="ml-8">📄 {exportData.componentName}.tsx</div>
              <div className="ml-8">📄 {exportData.componentName}.types.ts</div>
              {exportOptions.styling !== "tailwind" && (
                <>
                  <div className="ml-4">📁 styles/</div>
                  <div className="ml-8">📄 {exportData.componentName}.css</div>
                </>
              )}
              {exportOptions.includeTests && (
                <>
                  <div className="ml-4">📁 __tests__/</div>
                  <div className="ml-8">📄 {exportData.componentName}.test.tsx</div>
                </>
              )}
              {exportOptions.includeStorybook && (
                <>
                  <div className="ml-4">📁 stories/</div>
                  <div className="ml-8">📄 {exportData.componentName}.stories.tsx</div>
                </>
              )}
              <div>📄 package.json</div>
              <div>📄 README.md</div>
              <div>📄 tsconfig.json</div>
              {exportOptions.styling === "tailwind" && <div>📄 tailwind.config.js</div>}
            </div>
          </div>

          <Button
            onClick={handleZipDownload}
            disabled={isExporting}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generálás...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                ZIP Letöltése
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="github" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="github-token" className="text-sm font-semibold text-gray-300 mb-2 block">
                GitHub Personal Access Token
              </Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="bg-gray-800/60 border-gray-700/50 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Szükséges jogosultságok: repo, user</p>
            </div>

            <div>
              <Label htmlFor="repo-name" className="text-sm font-semibold text-gray-300 mb-2 block">
                Repository Név
              </Label>
              <Input
                id="repo-name"
                type="text"
                placeholder="my-figma-component"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="bg-gray-800/60 border-gray-700/50 text-white"
              />
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-4">
            <p className="text-xs text-yellow-300 leading-relaxed">
              <strong>Figyelem:</strong> Ez egy új publikus repository-t hoz létre a GitHub fiókodban. Győződj meg róla,
              hogy a token rendelkezik a szükséges jogosultságokkal.
            </p>
          </div>

          <Button
            onClick={handleGitHubExport}
            disabled={isExporting || !githubToken || !repoName}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600"
            size="lg"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Feltöltés...
              </>
            ) : (
              <>
                <Github className="w-4 h-4 mr-2" />
                GitHub-ra Feltöltés
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
