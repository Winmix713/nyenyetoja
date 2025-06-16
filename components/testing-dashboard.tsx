"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TestTube, CheckCircle, XCircle, Clock, Zap, Shield, Bug, Play, RotateCcw } from "lucide-react"

interface TestSuite {
  id: string
  name: string
  category: "unit" | "integration" | "e2e" | "performance" | "security"
  tests: Test[]
  status: "pending" | "running" | "passed" | "failed"
  duration?: number
}

interface Test {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "passed" | "failed" | "skipped"
  duration?: number
  error?: string
}

export function TestingDashboard() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: "unit-components",
      name: "Component Unit Tests",
      category: "unit",
      status: "pending",
      tests: [
        {
          id: "button-render",
          name: "Button Rendering",
          description: "Button komponens helyes renderelése",
          status: "pending",
        },
        { id: "card-props", name: "Card Props", description: "Card komponens props kezelése", status: "pending" },
        { id: "input-validation", name: "Input Validation", description: "Input mező validáció", status: "pending" },
        { id: "export-wizard", name: "Export Wizard", description: "Export wizard komponens", status: "pending" },
      ],
    },
    {
      id: "unit-hooks",
      name: "Custom Hooks Tests",
      category: "unit",
      status: "pending",
      tests: [
        { id: "use-figma-api", name: "useFigmaApi Hook", description: "Figma API hook tesztelése", status: "pending" },
        { id: "use-export", name: "useExport Hook", description: "Export hook tesztelése", status: "pending" },
        {
          id: "use-ai-service",
          name: "useAIService Hook",
          description: "AI service hook tesztelése",
          status: "pending",
        },
      ],
    },
    {
      id: "integration-figma",
      name: "Figma Integration Tests",
      category: "integration",
      status: "pending",
      tests: [
        {
          id: "figma-auth",
          name: "Figma Authentication",
          description: "Figma bejelentkezés tesztelése",
          status: "pending",
        },
        { id: "figma-import", name: "Figma Import", description: "Figma fájl importálás", status: "pending" },
        { id: "figma-parsing", name: "Figma Parsing", description: "Figma adatok feldolgozása", status: "pending" },
      ],
    },
    {
      id: "integration-export",
      name: "Export Integration Tests",
      category: "integration",
      status: "pending",
      tests: [
        { id: "zip-export", name: "ZIP Export", description: "ZIP fájl generálás és letöltés", status: "pending" },
        { id: "github-export", name: "GitHub Export", description: "GitHub repository létrehozás", status: "pending" },
        {
          id: "template-generation",
          name: "Template Generation",
          description: "Projekt template generálás",
          status: "pending",
        },
      ],
    },
    {
      id: "e2e-workflow",
      name: "End-to-End Workflow",
      category: "e2e",
      status: "pending",
      tests: [
        {
          id: "complete-journey",
          name: "Complete User Journey",
          description: "Teljes felhasználói folyamat",
          status: "pending",
        },
        {
          id: "error-recovery",
          name: "Error Recovery",
          description: "Hibakezelés és helyreállítás",
          status: "pending",
        },
        {
          id: "mobile-workflow",
          name: "Mobile Workflow",
          description: "Mobil eszközön való használat",
          status: "pending",
        },
      ],
    },
    {
      id: "performance",
      name: "Performance Tests",
      category: "performance",
      status: "pending",
      tests: [
        { id: "page-load", name: "Page Load Speed", description: "Oldal betöltési sebesség", status: "pending" },
        { id: "bundle-size", name: "Bundle Size", description: "JavaScript bundle méret", status: "pending" },
        { id: "memory-usage", name: "Memory Usage", description: "Memória használat", status: "pending" },
        {
          id: "export-performance",
          name: "Export Performance",
          description: "Export műveletek sebessége",
          status: "pending",
        },
      ],
    },
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  const runTestSuite = async (suiteId: string) => {
    setIsRunning(true)
    const suite = testSuites.find((s) => s.id === suiteId)
    if (!suite) return

    // Update suite status
    setTestSuites((prev) => prev.map((s) => (s.id === suiteId ? { ...s, status: "running" } : s)))

    // Run each test
    for (const test of suite.tests) {
      setCurrentTest(test.id)

      // Update test status to running
      setTestSuites((prev) =>
        prev.map((s) =>
          s.id === suiteId
            ? {
                ...s,
                tests: s.tests.map((t) => (t.id === test.id ? { ...t, status: "running" } : t)),
              }
            : s,
        ),
      )

      // Simulate test execution
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Random test result (90% pass rate)
      const passed = Math.random() > 0.1
      const duration = Math.floor(Math.random() * 1000) + 100

      setTestSuites((prev) =>
        prev.map((s) =>
          s.id === suiteId
            ? {
                ...s,
                tests: s.tests.map((t) =>
                  t.id === test.id
                    ? {
                        ...t,
                        status: passed ? "passed" : "failed",
                        duration,
                        error: passed ? undefined : "Test failed with mock error",
                      }
                    : t,
                ),
              }
            : s,
        ),
      )
    }

    // Update suite final status
    const finalSuite = testSuites.find((s) => s.id === suiteId)
    const allPassed = finalSuite?.tests.every((t) => t.status === "passed")

    setTestSuites((prev) =>
      prev.map((s) =>
        s.id === suiteId
          ? {
              ...s,
              status: allPassed ? "passed" : "failed",
              duration: s.tests.reduce((sum, t) => sum + (t.duration || 0), 0),
            }
          : s,
      ),
    )

    setCurrentTest(null)
    setIsRunning(false)
  }

  const runAllTests = async () => {
    for (const suite of testSuites) {
      await runTestSuite(suite.id)
    }
  }

  const resetTests = () => {
    setTestSuites((prev) =>
      prev.map((suite) => ({
        ...suite,
        status: "pending",
        duration: undefined,
        tests: suite.tests.map((test) => ({
          ...test,
          status: "pending",
          duration: undefined,
          error: undefined,
        })),
      })),
    )
    setCurrentTest(null)
    setIsRunning(false)
  }

  const getStats = () => {
    const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0)
    const passedTests = testSuites.reduce(
      (sum, suite) => sum + suite.tests.filter((t) => t.status === "passed").length,
      0,
    )
    const failedTests = testSuites.reduce(
      (sum, suite) => sum + suite.tests.filter((t) => t.status === "failed").length,
      0,
    )
    const totalDuration = testSuites.reduce((sum, suite) => sum + (suite.duration || 0), 0)

    return { totalTests, passedTests, failedTests, totalDuration }
  }

  const stats = getStats()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "unit":
        return <TestTube className="w-5 h-5" />
      case "integration":
        return <Zap className="w-5 h-5" />
      case "e2e":
        return <Play className="w-5 h-5" />
      case "performance":
        return <Clock className="w-5 h-5" />
      case "security":
        return <Shield className="w-5 h-5" />
      default:
        return <Bug className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "unit":
        return "text-blue-600"
      case "integration":
        return "text-green-600"
      case "e2e":
        return "text-purple-600"
      case "performance":
        return "text-orange-600"
      case "security":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "running":
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <TestTube className="w-6 h-6" />
            <span>Testing Dashboard</span>
          </h2>
          <p className="text-muted-foreground">Comprehensive testing suite for the application</p>
        </div>

        <div className="flex space-x-2">
          <Button onClick={runAllTests} disabled={isRunning}>
            <Play className="w-4 h-4 mr-2" />
            Run All Tests
          </Button>
          <Button variant="outline" onClick={resetTests} disabled={isRunning}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TestTube className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalTests}</div>
                <div className="text-sm text-muted-foreground">Összes teszt</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.passedTests}</div>
                <div className="text-sm text-muted-foreground">Sikeres</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.failedTests}</div>
                <div className="text-sm text-muted-foreground">Sikertelen</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalDuration}ms</div>
                <div className="text-sm text-muted-foreground">Futási idő</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isRunning && (
        <Alert>
          <Play className="h-4 w-4" />
          <AlertDescription>Tesztek futnak... {currentTest && `Jelenlegi teszt: ${currentTest}`}</AlertDescription>
        </Alert>
      )}

      {/* Test Suites */}
      <div className="space-y-4">
        {testSuites.map((suite) => (
          <Card key={suite.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={`flex items-center space-x-2 ${getCategoryColor(suite.category)}`}>
                  {getCategoryIcon(suite.category)}
                  <span>{suite.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {suite.category}
                  </Badge>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(suite.status)}
                  <Button variant="outline" size="sm" onClick={() => runTestSuite(suite.id)} disabled={isRunning}>
                    Run Suite
                  </Button>
                </div>
              </div>
              <CardDescription>
                {suite.tests.length} tests • {suite.duration ? `${suite.duration}ms` : "Not run"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suite.tests.map((test) => (
                  <div
                    key={test.id}
                    className={`flex items-center justify-between p-3 border rounded ${
                      test.status === "passed"
                        ? "bg-green-50 border-green-200"
                        : test.status === "failed"
                          ? "bg-red-50 border-red-200"
                          : test.status === "running"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-muted-foreground">{test.description}</div>
                        {test.error && <div className="text-sm text-red-600 mt-1">{test.error}</div>}
                      </div>
                    </div>
                    {test.duration && <Badge variant="outline">{test.duration}ms</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
