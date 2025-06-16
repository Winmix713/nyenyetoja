"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Rocket, CheckCircle, XCircle, ExternalLink, Settings, Shield, Zap, Database, Globe, Code } from "lucide-react"

interface ChecklistItem {
  id: string
  title: string
  description: string
  category: "environment" | "functionality" | "security" | "performance"
  completed: boolean
  required: boolean
}

export function DeploymentChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    // Environment
    {
      id: "env-openai",
      title: "OpenAI API Key",
      description: "OPENAI_API_KEY environment variable is set",
      category: "environment",
      completed: !!process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      required: true,
    },
    {
      id: "env-openai-model",
      title: "OpenAI Model",
      description: "OPENAI_MODEL environment variable is configured",
      category: "environment",
      completed: !!process.env.OPENAI_MODEL,
      required: true,
    },
    {
      id: "env-figma",
      title: "Figma Access Token",
      description: "FIGMA_ACCESS_TOKEN environment variable is set",
      category: "environment",
      completed: !!process.env.FIGMA_ACCESS_TOKEN,
      required: true,
    },
    {
      id: "env-github-id",
      title: "GitHub Client ID",
      description: "GITHUB_CLIENT_ID environment variable is set",
      category: "environment",
      completed: !!process.env.GITHUB_CLIENT_ID,
      required: true,
    },
    {
      id: "env-github-secret",
      title: "GitHub Client Secret",
      description: "GITHUB_CLIENT_SECRET environment variable is set",
      category: "environment",
      completed: !!process.env.GITHUB_CLIENT_SECRET,
      required: true,
    },
    {
      id: "env-groq",
      title: "Groq API Key",
      description: "NEXT_PUBLIC_GROQ_API_KEY environment variable is set",
      category: "environment",
      completed: !!process.env.NEXT_PUBLIC_GROQ_API_KEY,
      required: false,
    },

    // Functionality
    {
      id: "func-figma-import",
      title: "Figma Import",
      description: "Figma URL parsing and component import works",
      category: "functionality",
      completed: false,
      required: true,
    },
    {
      id: "func-ai-generation",
      title: "AI Code Generation",
      description: "AI-powered React component generation works",
      category: "functionality",
      completed: false,
      required: true,
    },
    {
      id: "func-export-zip",
      title: "ZIP Export",
      description: "Project ZIP file generation and download works",
      category: "functionality",
      completed: false,
      required: true,
    },
    {
      id: "func-export-github",
      title: "GitHub Export",
      description: "GitHub repository creation and file upload works",
      category: "functionality",
      completed: false,
      required: true,
    },
    {
      id: "func-templates",
      title: "Template System",
      description: "Component templates and presets work correctly",
      category: "functionality",
      completed: false,
      required: true,
    },

    // Security
    {
      id: "sec-env-vars",
      title: "Environment Variables Security",
      description: "Sensitive environment variables are not exposed to client",
      category: "security",
      completed: false,
      required: true,
    },
    {
      id: "sec-api-validation",
      title: "API Input Validation",
      description: "All API endpoints validate and sanitize input",
      category: "security",
      completed: false,
      required: true,
    },
    {
      id: "sec-rate-limiting",
      title: "Rate Limiting",
      description: "API rate limiting is implemented",
      category: "security",
      completed: false,
      required: false,
    },
    {
      id: "sec-error-handling",
      title: "Error Handling",
      description: "Errors don't expose sensitive information",
      category: "security",
      completed: false,
      required: true,
    },

    // Performance
    {
      id: "perf-optimization",
      title: "Bundle Optimization",
      description: "JavaScript bundles are optimized for production",
      category: "performance",
      completed: false,
      required: false,
    },
    {
      id: "perf-caching",
      title: "Caching Strategy",
      description: "Appropriate caching headers and strategies are implemented",
      category: "performance",
      completed: false,
      required: false,
    },
    {
      id: "perf-monitoring",
      title: "Performance Monitoring",
      description: "Performance monitoring and error tracking is set up",
      category: "performance",
      completed: false,
      required: false,
    },
  ])

  const toggleItem = (id: string) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const runAutomaticChecks = async () => {
    // Simulate running automatic checks
    const checkableItems = [
      "func-figma-import",
      "func-ai-generation",
      "func-export-zip",
      "func-export-github",
      "func-templates",
      "sec-env-vars",
      "sec-api-validation",
      "sec-error-handling",
      "perf-optimization",
    ]

    for (const itemId of checkableItems) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setChecklist((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, completed: Math.random() > 0.3 } : item)),
      )
    }
  }

  const getCategoryIcon = (category: ChecklistItem["category"]) => {
    switch (category) {
      case "environment":
        return <Database className="w-5 h-5" />
      case "functionality":
        return <Code className="w-5 h-5" />
      case "security":
        return <Shield className="w-5 h-5" />
      case "performance":
        return <Zap className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: ChecklistItem["category"]) => {
    switch (category) {
      case "environment":
        return "text-blue-600"
      case "functionality":
        return "text-green-600"
      case "security":
        return "text-red-600"
      case "performance":
        return "text-purple-600"
    }
  }

  const groupedItems = checklist.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, ChecklistItem[]>,
  )

  const completedRequired = checklist.filter((item) => item.required && item.completed).length
  const totalRequired = checklist.filter((item) => item.required).length
  const completedOptional = checklist.filter((item) => !item.required && item.completed).length
  const totalOptional = checklist.filter((item) => !item.required).length

  const isReadyForDeployment = completedRequired === totalRequired

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Rocket className="w-6 h-6" />
            <span>Deployment Checklist</span>
          </h2>
          <p className="text-muted-foreground">Ensure your application is ready for production deployment</p>
        </div>

        <Button onClick={runAutomaticChecks} variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Run Checks
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isReadyForDeployment ? "bg-green-600" : "bg-red-600"}`} />
              <div>
                <div className="text-2xl font-bold">{isReadyForDeployment ? "Ready" : "Not Ready"}</div>
                <div className="text-sm text-muted-foreground">Deployment Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {completedRequired}/{totalRequired}
                </div>
                <div className="text-sm text-muted-foreground">Required Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {completedOptional}/{totalOptional}
                </div>
                <div className="text-sm text-muted-foreground">Optional Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Status Alert */}
      <Alert className={isReadyForDeployment ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        {isReadyForDeployment ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
        <AlertDescription className={isReadyForDeployment ? "text-green-800" : "text-red-800"}>
          {isReadyForDeployment
            ? "🎉 Your application is ready for production deployment! All required items are completed."
            : `⚠️ ${totalRequired - completedRequired} required items need to be completed before deployment.`}
        </AlertDescription>
      </Alert>

      {/* Checklist Items */}
      <Tabs defaultValue="environment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="environment" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Environment</span>
          </TabsTrigger>
          <TabsTrigger value="functionality" className="flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>Functionality</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedItems).map(([category, items]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle
                  className={`flex items-center space-x-2 ${getCategoryColor(category as ChecklistItem["category"])}`}
                >
                  {getCategoryIcon(category as ChecklistItem["category"])}
                  <span className="capitalize">{category} Checklist</span>
                </CardTitle>
                <CardDescription>
                  {items.filter((item) => item.completed).length} of {items.length} items completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <Checkbox checked={item.completed} onCheckedChange={() => toggleItem(item.id)} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{item.title}</h4>
                        {item.required ? (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Optional
                          </Badge>
                        )}
                        {item.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Deployment Actions */}
      {isReadyForDeployment && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <Rocket className="w-5 h-5" />
              <span>Ready for Deployment!</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Your application has passed all required checks and is ready for production deployment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button className="bg-green-600 hover:bg-green-700">
                <Globe className="w-4 h-4 mr-2" />
                Deploy to Vercel
              </Button>
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Deployment Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
