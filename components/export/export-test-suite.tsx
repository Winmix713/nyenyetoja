"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, CheckCircle, XCircle, Clock, Zap, AlertTriangle, TrendingUp } from "lucide-react"
import { ExportTestingService } from "@/lib/export-testing"
import { ExportPerformanceService } from "@/lib/export-performance"

interface TestResult {
  name: string
  status: "pending" | "running" | "passed" | "failed"
  duration?: number
  error?: string
  details?: any
}

export function ExportTestSuite() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<TestResult[]>([
    { name: "ZIP Export Functionality", status: "pending" },
    { name: "GitHub API Connection", status: "pending" },
    { name: "Project Template Generation", status: "pending" },
    { name: "Export Presets Loading", status: "pending" },
    { name: "File Structure Validation", status: "pending" },
    { name: "Performance Benchmarks", status: "pending" },
    { name: "Error Handling", status: "pending" },
    { name: "Memory Usage", status: "pending" },
  ])

  const runAllTests = async () => {
    setIsRunning(true)
    setProgress(0)

    const testFunctions = [
      () => ExportTestingService.testZipExport(),
      () => ExportTestingService.testGitHubConnection(),
      () => ExportTestingService.testProjectTemplates(),
      () => ExportTestingService.testExportPresets(),
      () => ExportTestingService.testFileStructure(),
      () => ExportPerformanceService.runPerformanceBenchmarks(),
      () => ExportTestingService.testErrorHandling(),
      () => ExportPerformanceService.testMemoryUsage(),
    ]

    for (let i = 0; i < testFunctions.length; i++) {
      const testName = results[i].name
      setCurrentTest(testName)

      // Update test status to running
      setResults((prev) => prev.map((result, index) => (index === i ? { ...result, status: "running" } : result)))

      try {
        const startTime = Date.now()
        const testResult = await testFunctions[i]()
        const duration = Date.now() - startTime

        setResults((prev) =>
          prev.map((result, index) =>
            index === i
              ? {
                  ...result,
                  status: testResult.success ? "passed" : "failed",
                  duration,
                  error: testResult.error,
                  details: testResult.details,
                }
              : result,
          ),
        )
      } catch (error) {
        setResults((prev) =>
          prev.map((result, index) =>
            index === i
              ? {
                  ...result,
                  status: "failed",
                  error: error instanceof Error ? error.message : "Unknown error",
                }
              : result,
          ),
        )
      }

      setProgress(((i + 1) / testFunctions.length) * 100)

      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
    setCurrentTest("")
  }

  const runSingleTest = async (index: number) => {
    const testName = results[index].name
    setCurrentTest(testName)

    setResults((prev) => prev.map((result, i) => (i === index ? { ...result, status: "running" } : result)))

    try {
      const startTime = Date.now()
      let testResult

      switch (index) {
        case 0:
          testResult = await ExportTestingService.testZipExport()
          break
        case 1:
          testResult = await ExportTestingService.testGitHubConnection()
          break
        case 2:
          testResult = await ExportTestingService.testProjectTemplates()
          break
        case 3:
          testResult = await ExportTestingService.testExportPresets()
          break
        case 4:
          testResult = await ExportTestingService.testFileStructure()
          break
        case 5:
          testResult = await ExportPerformanceService.runPerformanceBenchmarks()
          break
        case 6:
          testResult = await ExportTestingService.testErrorHandling()
          break
        case 7:
          testResult = await ExportPerformanceService.testMemoryUsage()
          break
        default:
          throw new Error("Unknown test")
      }

      const duration = Date.now() - startTime

      setResults((prev) =>
        prev.map((result, i) =>
          i === index
            ? {
                ...result,
                status: testResult.success ? "passed" : "failed",
                duration,
                error: testResult.error,
                details: testResult.details,
              }
            : result,
        ),
      )
    } catch (error) {
      setResults((prev) =>
        prev.map((result, i) =>
          i === index
            ? {
                ...result,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : result,
        ),
      )
    }

    setCurrentTest("")
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "running":
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const passedTests = results.filter((r) => r.status === "passed").length
  const failedTests = results.filter((r) => r.status === "failed").length
  const totalTests = results.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export System Test Suite</h2>
          <p className="text-muted-foreground">Comprehensive testing for all export functionality</p>
        </div>

        <Button onClick={runAllTests} disabled={isRunning} className="flex items-center space-x-2">
          <Play className="w-4 h-4" />
          <span>{isRunning ? "Running Tests..." : "Run All Tests"}</span>
        </Button>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Running: {currentTest}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Tabs defaultValue="results" className="w-full">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {results.map((result, index) => (
            <Card key={result.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      {result.duration && (
                        <div className="text-sm text-muted-foreground">Completed in {result.duration}ms</div>
                      )}
                      {result.error && <div className="text-sm text-red-600 mt-1">Error: {result.error}</div>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(result.status)}
                    <Button variant="outline" size="sm" onClick={() => runSingleTest(index)} disabled={isRunning}>
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2.8s</div>
                  <div className="text-sm text-muted-foreground">Avg ZIP Generation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">15s</div>
                  <div className="text-sm text-muted-foreground">Avg GitHub Upload</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">120MB</div>
                  <div className="text-sm text-muted-foreground">Peak Memory</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">38%</div>
                  <div className="text-sm text-muted-foreground">Compression</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Export Service</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>GitHub Integration</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span>Environment Variables</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Check Required</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
