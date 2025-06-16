"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Circle, Package, Zap, AlertTriangle } from "lucide-react"

interface MissingComponent {
  name: string
  category: string
  priority: "high" | "medium" | "low"
  estimatedHours: number
  dependencies: string[]
  description: string
  implemented: boolean
}

export function MissingComponentsDashboard() {
  const [components, setComponents] = useState<MissingComponent[]>([
    // UI Foundation - HIGH PRIORITY
    {
      name: "Skeleton",
      category: "UI Foundation",
      priority: "high",
      estimatedHours: 2,
      dependencies: [],
      description: "Loading placeholder component",
      implemented: false,
    },
    {
      name: "Tooltip",
      category: "UI Foundation",
      priority: "high",
      estimatedHours: 3,
      dependencies: ["Popover"],
      description: "Hover information display",
      implemented: false,
    },
    {
      name: "Popover",
      category: "UI Foundation",
      priority: "high",
      estimatedHours: 4,
      dependencies: [],
      description: "Floating content container",
      implemented: false,
    },
    {
      name: "ScrollArea",
      category: "UI Foundation",
      priority: "high",
      estimatedHours: 3,
      dependencies: [],
      description: "Custom scrollbar component",
      implemented: false,
    },

    // Navigation - HIGH PRIORITY
    {
      name: "Breadcrumb",
      category: "Navigation",
      priority: "high",
      estimatedHours: 2,
      dependencies: [],
      description: "Navigation path indicator",
      implemented: false,
    },
    {
      name: "Sidebar",
      category: "Navigation",
      priority: "high",
      estimatedHours: 4,
      dependencies: ["Button"],
      description: "Collapsible side navigation",
      implemented: false,
    },
    {
      name: "Footer",
      category: "Navigation",
      priority: "high",
      estimatedHours: 2,
      dependencies: [],
      description: "Page footer component",
      implemented: false,
    },

    // Feedback - HIGH PRIORITY
    {
      name: "Toast",
      category: "Feedback",
      priority: "high",
      estimatedHours: 4,
      dependencies: ["Button"],
      description: "Notification messages",
      implemented: false,
    },
    {
      name: "Spinner",
      category: "Feedback",
      priority: "high",
      estimatedHours: 1,
      dependencies: [],
      description: "Loading indicator",
      implemented: false,
    },
    {
      name: "EmptyState",
      category: "Feedback",
      priority: "high",
      estimatedHours: 2,
      dependencies: ["Button"],
      description: "No data placeholder",
      implemented: false,
    },
    {
      name: "ConfirmDialog",
      category: "Feedback",
      priority: "high",
      estimatedHours: 3,
      dependencies: ["Dialog", "Button"],
      description: "Confirmation modal",
      implemented: false,
    },

    // Figma Specific - HIGH PRIORITY
    {
      name: "FigmaPreview",
      category: "Figma Specific",
      priority: "high",
      estimatedHours: 6,
      dependencies: [],
      description: "Live Figma design preview",
      implemented: false,
    },
    {
      name: "ComponentLibrary",
      category: "Figma Specific",
      priority: "high",
      estimatedHours: 8,
      dependencies: ["Card", "Button"],
      description: "Component browser and manager",
      implemented: false,
    },
    {
      name: "LayerTree",
      category: "Figma Specific",
      priority: "high",
      estimatedHours: 6,
      dependencies: [],
      description: "Figma layer hierarchy viewer",
      implemented: false,
    },

    // Forms - MEDIUM PRIORITY
    {
      name: "Form",
      category: "Forms",
      priority: "medium",
      estimatedHours: 4,
      dependencies: ["Input", "Button"],
      description: "Form wrapper with validation",
      implemented: false,
    },
    {
      name: "RadioGroup",
      category: "Forms",
      priority: "medium",
      estimatedHours: 2,
      dependencies: [],
      description: "Radio button group",
      implemented: false,
    },
    {
      name: "Switch",
      category: "Forms",
      priority: "medium",
      estimatedHours: 2,
      dependencies: [],
      description: "Toggle switch component",
      implemented: false,
    },
    {
      name: "DatePicker",
      category: "Forms",
      priority: "medium",
      estimatedHours: 6,
      dependencies: ["Calendar", "Popover"],
      description: "Date selection component",
      implemented: false,
    },

    // Data Display - MEDIUM PRIORITY
    {
      name: "Table",
      category: "Data Display",
      priority: "medium",
      estimatedHours: 4,
      dependencies: [],
      description: "Data table component",
      implemented: false,
    },
    {
      name: "DataTable",
      category: "Data Display",
      priority: "medium",
      estimatedHours: 8,
      dependencies: ["Table", "Button"],
      description: "Advanced data table with sorting/filtering",
      implemented: false,
    },
    {
      name: "Avatar",
      category: "Data Display",
      priority: "medium",
      estimatedHours: 2,
      dependencies: [],
      description: "User avatar component",
      implemented: false,
    },
    {
      name: "Calendar",
      category: "Data Display",
      priority: "medium",
      estimatedHours: 6,
      dependencies: ["Button"],
      description: "Calendar component",
      implemented: false,
    },

    // Export Specific - MEDIUM PRIORITY
    {
      name: "CodePreview",
      category: "Export Specific",
      priority: "medium",
      estimatedHours: 4,
      dependencies: [],
      description: "Syntax highlighted code display",
      implemented: false,
    },
    {
      name: "FileTree",
      category: "Export Specific",
      priority: "medium",
      estimatedHours: 4,
      dependencies: [],
      description: "Project file structure viewer",
      implemented: false,
    },
    {
      name: "DiffViewer",
      category: "Export Specific",
      priority: "medium",
      estimatedHours: 6,
      dependencies: [],
      description: "Code difference viewer",
      implemented: false,
    },

    // Layout - LOW PRIORITY
    {
      name: "Container",
      category: "Layout",
      priority: "low",
      estimatedHours: 1,
      dependencies: [],
      description: "Content container with max-width",
      implemented: false,
    },
    {
      name: "Grid",
      category: "Layout",
      priority: "low",
      estimatedHours: 2,
      dependencies: [],
      description: "CSS Grid wrapper component",
      implemented: false,
    },
    {
      name: "Stack",
      category: "Layout",
      priority: "low",
      estimatedHours: 2,
      dependencies: [],
      description: "Flexbox stack component",
      implemented: false,
    },
  ])

  const toggleImplemented = (name: string) => {
    setComponents((prev) =>
      prev.map((comp) => (comp.name === name ? { ...comp, implemented: !comp.implemented } : comp)),
    )
  }

  const categories = [...new Set(components.map((c) => c.category))]
  const priorities = ["high", "medium", "low"] as const

  const getStats = () => {
    const total = components.length
    const implemented = components.filter((c) => c.implemented).length
    const highPriority = components.filter((c) => c.priority === "high").length
    const totalHours = components.filter((c) => !c.implemented).reduce((sum, c) => sum + c.estimatedHours, 0)

    return { total, implemented, highPriority, totalHours, progress: (implemented / total) * 100 }
  }

  const stats = getStats()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <Package className="w-6 h-6" />
          <span>Hiányzó Komponensek Dashboard</span>
        </h2>
        <p className="text-muted-foreground">Komponens fejlesztési terv és progress tracking</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Összes komponens</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.implemented}</div>
                <div className="text-sm text-muted-foreground">Implementált</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                <div className="text-sm text-muted-foreground">Magas prioritás</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalHours}h</div>
                <div className="text-sm text-muted-foreground">Becsült munka</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Fejlesztési Progress</CardTitle>
          <CardDescription>Komponens implementáció állapota</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{stats.progress.toFixed(1)}%</span>
            </div>
            <Progress value={stats.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Component Lists */}
      <Tabs defaultValue="priority" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="priority">Prioritás szerint</TabsTrigger>
          <TabsTrigger value="category">Kategória szerint</TabsTrigger>
        </TabsList>

        <TabsContent value="priority" className="space-y-4">
          {priorities.map((priority) => {
            const priorityComponents = components.filter((c) => c.priority === priority)
            const priorityHours = priorityComponents
              .filter((c) => !c.implemented)
              .reduce((sum, c) => sum + c.estimatedHours, 0)

            return (
              <Card key={priority}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{priority} Priority</span>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(priority)}>{priorityComponents.length} komponens</Badge>
                      <Badge variant="outline">{priorityHours}h</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {priorityComponents.map((component) => (
                      <div
                        key={component.name}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          component.implemented ? "bg-green-50 border-green-200" : "hover:bg-muted"
                        }`}
                        onClick={() => toggleImplemented(component.name)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{component.name}</h4>
                          {component.implemented ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{component.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline">{component.category}</Badge>
                          <span className="text-muted-foreground">{component.estimatedHours}h</span>
                        </div>
                        {component.dependencies.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground">Függőségek:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {component.dependencies.map((dep) => (
                                <Badge key={dep} variant="secondary" className="text-xs">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          {categories.map((category) => {
            const categoryComponents = components.filter((c) => c.category === category)
            const categoryHours = categoryComponents
              .filter((c) => !c.implemented)
              .reduce((sum, c) => sum + c.estimatedHours, 0)

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{categoryComponents.length} komponens</Badge>
                      <Badge variant="outline">{categoryHours}h</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryComponents.map((component) => (
                      <div
                        key={component.name}
                        className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                          component.implemented ? "bg-green-50 border-green-200" : "hover:bg-muted"
                        }`}
                        onClick={() => toggleImplemented(component.name)}
                      >
                        <div className="flex items-center space-x-3">
                          {component.implemented ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium">{component.name}</div>
                            <div className="text-sm text-muted-foreground">{component.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(component.priority)}>{component.priority}</Badge>
                          <span className="text-sm text-muted-foreground">{component.estimatedHours}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
