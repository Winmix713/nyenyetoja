"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Rocket, Package, Building, Plus, Star, Clock, Users, Settings, Check, X } from "lucide-react"
import { ExportPresetService, type ExportPreset } from "@/lib/export-presets"

interface ExportPresetsSelectorProps {
  onPresetSelect: (preset: ExportPreset) => void
  selectedPreset?: ExportPreset
}

const PRESET_ICONS = {
  starter: Zap,
  production: Rocket,
  library: Package,
  enterprise: Building,
}

const PRESET_COLORS = {
  starter: "bg-blue-50 border-blue-200 text-blue-800",
  production: "bg-green-50 border-green-200 text-green-800",
  library: "bg-purple-50 border-purple-200 text-purple-800",
  enterprise: "bg-orange-50 border-orange-200 text-orange-800",
}

export function ExportPresetsSelector({ onPresetSelect, selectedPreset }: ExportPresetsSelectorProps) {
  const [presets] = useState(() => ExportPresetService.getAllPresets())
  const [customPresets] = useState(() => ExportPresetService.getCustomPresets())
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newPreset, setNewPreset] = useState<Partial<ExportPreset>>({
    name: "",
    description: "",
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
    category: "starter",
  })

  const handleCreatePreset = () => {
    if (!newPreset.name || !newPreset.description) return

    const preset = ExportPresetService.createCustomPreset(newPreset as Omit<ExportPreset, "id">)
    onPresetSelect(preset)
    setShowCreateDialog(false)
    setNewPreset({
      name: "",
      description: "",
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
      category: "starter",
    })
  }

  const groupedPresets = presets.reduce(
    (acc, preset) => {
      if (!acc[preset.category]) {
        acc[preset.category] = []
      }
      acc[preset.category].push(preset)
      return acc
    },
    {} as Record<string, ExportPreset[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Export Presets</h3>
          <p className="text-sm text-muted-foreground">Choose a pre-configured setup or create your own</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Custom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Preset</DialogTitle>
              <DialogDescription>Configure your own export preset with custom settings</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preset-name">Preset Name</Label>
                    <Input
                      id="preset-name"
                      value={newPreset.name}
                      onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
                      placeholder="My Custom Preset"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preset-category">Category</Label>
                    <Select
                      value={newPreset.category}
                      onValueChange={(value: any) => setNewPreset({ ...newPreset, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="preset-description">Description</Label>
                  <Textarea
                    id="preset-description"
                    value={newPreset.description}
                    onChange={(e) => setNewPreset({ ...newPreset, description: e.target.value })}
                    placeholder="Describe your preset configuration..."
                    rows={2}
                  />
                </div>
              </div>

              <Tabs defaultValue="framework" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="framework">Framework</TabsTrigger>
                  <TabsTrigger value="tools">Dev Tools</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                </TabsList>

                <TabsContent value="framework" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Framework</Label>
                      <Select
                        value={newPreset.framework}
                        onValueChange={(value: any) => setNewPreset({ ...newPreset, framework: value })}
                      >
                        <SelectTrigger>
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
                      <Label>Styling</Label>
                      <Select
                        value={newPreset.styling}
                        onValueChange={(value: any) => setNewPreset({ ...newPreset, styling: value })}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="typescript"
                        checked={newPreset.typescript}
                        onCheckedChange={(checked) => setNewPreset({ ...newPreset, typescript: !!checked })}
                      />
                      <Label htmlFor="typescript">TypeScript</Label>
                    </div>

                    <div>
                      <Label>Package Manager</Label>
                      <Select
                        value={newPreset.packageManager}
                        onValueChange={(value: any) => setNewPreset({ ...newPreset, packageManager: value })}
                      >
                        <SelectTrigger>
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
                </TabsContent>

                <TabsContent value="tools" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="eslint"
                        checked={newPreset.eslintConfig}
                        onCheckedChange={(checked) => setNewPreset({ ...newPreset, eslintConfig: !!checked })}
                      />
                      <Label htmlFor="eslint">ESLint Configuration</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prettier"
                        checked={newPreset.prettierConfig}
                        onCheckedChange={(checked) => setNewPreset({ ...newPreset, prettierConfig: !!checked })}
                      />
                      <Label htmlFor="prettier">Prettier Configuration</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gitignore"
                        checked={newPreset.gitignore}
                        onCheckedChange={(checked) => setNewPreset({ ...newPreset, gitignore: !!checked })}
                      />
                      <Label htmlFor="gitignore">Include .gitignore</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tests"
                        checked={newPreset.includeTests}
                        onCheckedChange={(checked) => setNewPreset({ ...newPreset, includeTests: !!checked })}
                      />
                      <Label htmlFor="tests">Include Tests</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="storybook"
                        checked={newPreset.includeStorybook}
                        onCheckedChange={(checked) => setNewPreset({ ...newPreset, includeStorybook: !!checked })}
                      />
                      <Label htmlFor="storybook">Include Storybook</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="docs"
                        checked={newPreset.includeDocumentation}
                        onCheckedChange={(checked) => setNewPreset({ ...newPreset, includeDocumentation: !!checked })}
                      />
                      <Label htmlFor="docs">Include Documentation</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Quality Features Preview</h4>
                    <div className="space-y-2 text-sm">
                      {newPreset.eslintConfig && (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          ESLint for code quality
                        </div>
                      )}
                      {newPreset.prettierConfig && (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          Prettier for code formatting
                        </div>
                      )}
                      {newPreset.includeTests && (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          Jest + Testing Library setup
                        </div>
                      )}
                      {newPreset.typescript && (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          TypeScript for type safety
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePreset} disabled={!newPreset.name || !newPreset.description}>
                  Create Preset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preset Categories */}
      <Tabs defaultValue="starter" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="starter" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Starter
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            Production
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Library
          </TabsTrigger>
          <TabsTrigger value="enterprise" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Enterprise
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedPresets).map(([category, categoryPresets]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryPresets.map((preset) => {
                const Icon = PRESET_ICONS[preset.category as keyof typeof PRESET_ICONS]
                const isSelected = selectedPreset?.id === preset.id
                const isCustom = customPresets.some((p) => p.id === preset.id)

                return (
                  <Card
                    key={preset.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => onPresetSelect(preset)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-2 rounded-lg ${PRESET_COLORS[preset.category as keyof typeof PRESET_COLORS]}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {preset.name}
                              {isCustom && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Custom
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-sm">{preset.description}</CardDescription>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="p-1 bg-blue-600 rounded-full">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Tech Stack */}
                        <div>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {preset.framework === "next" ? "Next.js" : preset.framework}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {preset.styling === "tailwind" ? "Tailwind" : preset.styling}
                            </Badge>
                            {preset.typescript && (
                              <Badge variant="outline" className="text-xs">
                                TypeScript
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {preset.packageManager}
                            </Badge>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-1">
                            {preset.includeTests ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <X className="w-3 h-3 text-gray-400" />
                            )}
                            <span className={preset.includeTests ? "text-green-600" : "text-gray-400"}>Tests</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            {preset.includeStorybook ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <X className="w-3 h-3 text-gray-400" />
                            )}
                            <span className={preset.includeStorybook ? "text-green-600" : "text-gray-400"}>
                              Storybook
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            {preset.eslintConfig ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <X className="w-3 h-3 text-gray-400" />
                            )}
                            <span className={preset.eslintConfig ? "text-green-600" : "text-gray-400"}>ESLint</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            {preset.prettierConfig ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <X className="w-3 h-3 text-gray-400" />
                            )}
                            <span className={preset.prettierConfig ? "text-green-600" : "text-gray-400"}>Prettier</span>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              ~{preset.category === "enterprise" ? "10" : preset.category === "production" ? "5" : "2"}{" "}
                              min setup
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>
                              {preset.category === "starter"
                                ? "Solo"
                                : preset.category === "enterprise"
                                  ? "Team"
                                  : "Small Team"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {categoryPresets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No presets in this category yet.</p>
                <p className="text-sm">Create a custom preset to get started!</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Selected Preset Summary */}
      {selectedPreset && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Selected: {selectedPreset.name}</h4>
                <p className="text-sm text-blue-700">{selectedPreset.description}</p>
              </div>
              <Badge className="bg-blue-600">Ready to Export</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
