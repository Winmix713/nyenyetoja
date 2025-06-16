"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Github, Settings, Zap, CheckCircle } from "lucide-react"

interface ExportOptions {
  framework: "react" | "next" | "vite"
  styling: "css" | "tailwind" | "styled-components"
  typescript: boolean
  includeTests: boolean
  includeStorybook: boolean
  includeDocumentation: boolean
  packageManager: "npm" | "yarn" | "pnpm"
  eslintConfig: boolean
  prettierConfig: boolean
  gitignore: boolean
}

interface ExportWizardProps {
  component: any
  onExportComplete: (result: string) => void
}

export function ExportWizard({ component, onExportComplete }: ExportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    framework: "react",
    styling: "tailwind",
    typescript: true,
    includeTests: false,
    includeStorybook: false,
    includeDocumentation: true,
    packageManager: "npm",
    eslintConfig: true,
    prettierConfig: true,
    gitignore: true,
  })
  const [githubOptions, setGithubOptions] = useState({
    repoName: component.componentName.toLowerCase(),
    description: `React component generated from Figma`,
    private: false,
    includeReadme: true,
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const steps = [
    { id: 1, title: "Framework & Styling", icon: Settings },
    { id: 2, title: "Project Options", icon: Zap },
    { id: 3, title: "Export Method", icon: Download },
    { id: 4, title: "Finalize", icon: CheckCircle },
  ]

  const handleExport = async (method: "zip" | "github") => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      if (method === "zip") {
        // ZIP export logic would go here
        await new Promise((resolve) => setTimeout(resolve, 2000))
        onExportComplete("ZIP file downloaded successfully!")
      } else {
        // GitHub export logic would go here
        await new Promise((resolve) => setTimeout(resolve, 3000))
        onExportComplete(`Repository created: https://github.com/user/${githubOptions.repoName}`)
      }

      clearInterval(progressInterval)
      setExportProgress(100)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Framework & Styling */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="framework">Framework</Label>
                  <Select
                    value={exportOptions.framework}
                    onValueChange={(value: any) => setExportOptions({ ...exportOptions, framework: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React (CRA)</SelectItem>
                      <SelectItem value="vite">React (Vite)</SelectItem>
                      <SelectItem value="next">Next.js</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="styling">Styling</Label>
                  <Select
                    value={exportOptions.styling}
                    onValueChange={(value: any) => setExportOptions({ ...exportOptions, styling: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="css">Plain CSS</SelectItem>
                      <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                      <SelectItem value="styled-components">Styled Components</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="typescript"
                  checked={exportOptions.typescript}
                  onCheckedChange={(checked) => setExportOptions({ ...exportOptions, typescript: !!checked })}
                />
                <Label htmlFor="typescript">Use TypeScript</Label>
                <Badge variant="secondary">Recommended</Badge>
              </div>
            </div>
          )}

          {/* Step 2: Project Options */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Development Tools</h4>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tests"
                      checked={exportOptions.includeTests}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeTests: !!checked })}
                    />
                    <Label htmlFor="tests">Include Tests</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="storybook"
                      checked={exportOptions.includeStorybook}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, includeStorybook: !!checked })}
                    />
                    <Label htmlFor="storybook">Include Storybook</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="docs"
                      checked={exportOptions.includeDocumentation}
                      onCheckedChange={(checked) =>
                        setExportOptions({ ...exportOptions, includeDocumentation: !!checked })
                      }
                    />
                    <Label htmlFor="docs">Include Documentation</Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Code Quality</h4>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="eslint"
                      checked={exportOptions.eslintConfig}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, eslintConfig: !!checked })}
                    />
                    <Label htmlFor="eslint">ESLint Configuration</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="prettier"
                      checked={exportOptions.prettierConfig}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, prettierConfig: !!checked })}
                    />
                    <Label htmlFor="prettier">Prettier Configuration</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gitignore"
                      checked={exportOptions.gitignore}
                      onCheckedChange={(checked) => setExportOptions({ ...exportOptions, gitignore: !!checked })}
                    />
                    <Label htmlFor="gitignore">Include .gitignore</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="packageManager">Package Manager</Label>
                <Select
                  value={exportOptions.packageManager}
                  onValueChange={(value: any) => setExportOptions({ ...exportOptions, packageManager: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="npm">npm</SelectItem>
                    <SelectItem value="yarn">Yarn</SelectItem>
                    <SelectItem value="pnpm">pnpm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Export Method */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Download className="w-12 h-12 mx-auto text-blue-600" />
                      <h3 className="font-medium">Download ZIP</h3>
                      <p className="text-sm text-muted-foreground">Download a complete project as a ZIP file</p>
                      <Button onClick={() => handleExport("zip")} disabled={isExporting} className="w-full">
                        {isExporting ? "Generating..." : "Download ZIP"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Github className="w-12 h-12 mx-auto text-gray-800" />
                      <h3 className="font-medium">Push to GitHub</h3>
                      <p className="text-sm text-muted-foreground">Create a new repository on GitHub</p>

                      <div className="space-y-2">
                        <Input
                          placeholder="Repository name"
                          value={githubOptions.repoName}
                          onChange={(e) => setGithubOptions({ ...githubOptions, repoName: e.target.value })}
                        />
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="private"
                            checked={githubOptions.private}
                            onCheckedChange={(checked) => setGithubOptions({ ...githubOptions, private: !!checked })}
                          />
                          <Label htmlFor="private" className="text-sm">
                            Private repository
                          </Label>
                        </div>
                      </div>

                      <Button onClick={() => handleExport("github")} disabled={isExporting} className="w-full">
                        {isExporting ? "Creating..." : "Create Repository"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Export Progress</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="w-full" />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Finalize */}
          {currentStep === 4 && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
              <h3 className="text-xl font-medium">Export Complete!</h3>
              <p className="text-muted-foreground">
                Your component has been successfully exported with the selected options.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <h4 className="font-medium mb-2">Export Summary:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Framework: {exportOptions.framework}</li>
                  <li>• Styling: {exportOptions.styling}</li>
                  <li>• TypeScript: {exportOptions.typescript ? "Yes" : "No"}</li>
                  <li>• Tests: {exportOptions.includeTests ? "Included" : "Not included"}</li>
                  <li>• Package Manager: {exportOptions.packageManager}</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1 || isExporting}
        >
          Previous
        </Button>

        {currentStep < 4 && (
          <Button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))} disabled={isExporting}>
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
