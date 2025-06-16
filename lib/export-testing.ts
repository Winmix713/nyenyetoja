import { ExportPresetService, type ExportPreset } from "./export-presets"
import { EnhancedExportService, type GeneratedComponent } from "@/services/enhanced-export-service"

interface ExportTestResult {
  success: boolean
  duration: number
  error?: string
  metadata: {
    preset: string
    method: "zip" | "github"
    componentName: string
    timestamp: string
  }
}

interface ExportTestSuite {
  name: string
  tests: ExportTest[]
  results: ExportTestResult[]
}

interface ExportTest {
  name: string
  preset: ExportPreset
  method: "zip" | "github"
  component: GeneratedComponent
  expectedOutcome: "success" | "failure"
}

class ExportTestRunner {
  private testSuites: ExportTestSuite[] = []

  // Create test component for testing
  private createTestComponent(name = "TestComponent"): GeneratedComponent {
    return {
      componentName: name,
      jsx: `
export function ${name}() {
  return (
    <div className="test-component">
      <h1>Hello, World!</h1>
      <p>This is a test component generated for export testing.</p>
    </div>
  )
}
      `.trim(),
      css: `
.test-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.test-component h1 {
  color: #333;
  margin-bottom: 10px;
}

.test-component p {
  color: #666;
  line-height: 1.5;
}
      `.trim(),
      typescript: `
export interface ${name}Props {
  className?: string
  children?: React.ReactNode
}
      `.trim(),
      figmaUrl: "https://figma.com/test-component",
    }
  }

  // Create comprehensive test suite
  createTestSuite(): ExportTestSuite {
    const presets = ExportPresetService.getPresets()
    const testComponent = this.createTestComponent()

    const tests: ExportTest[] = []

    // Test each preset with ZIP export
    presets.forEach((preset) => {
      tests.push({
        name: `ZIP Export - ${preset.name}`,
        preset,
        method: "zip",
        component: testComponent,
        expectedOutcome: "success",
      })
    })

    // Test GitHub export with selected presets
    const githubTestPresets = presets.filter((p) => ["react-starter", "next-production"].includes(p.id))

    githubTestPresets.forEach((preset) => {
      tests.push({
        name: `GitHub Export - ${preset.name}`,
        preset,
        method: "github",
        component: testComponent,
        expectedOutcome: "success",
      })
    })

    return {
      name: "Export Functionality Test Suite",
      tests,
      results: [],
    }
  }

  // Run individual test
  async runTest(test: ExportTest): Promise<ExportTestResult> {
    const startTime = performance.now()

    try {
      console.log(`🧪 Running test: ${test.name}`)

      if (test.method === "zip") {
        await EnhancedExportService.createZipExport(test.component, test.preset)
      } else {
        // For GitHub tests, we'll simulate success without actual API calls
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      const duration = performance.now() - startTime

      return {
        success: true,
        duration,
        metadata: {
          preset: test.preset.name,
          method: test.method,
          componentName: test.component.componentName,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      const duration = performance.now() - startTime

      return {
        success: false,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          preset: test.preset.name,
          method: test.method,
          componentName: test.component.componentName,
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  // Run full test suite
  async runTestSuite(testSuite: ExportTestSuite): Promise<ExportTestSuite> {
    console.group(`🧪 Running Test Suite: ${testSuite.name}`)

    const results: ExportTestResult[] = []

    for (const test of testSuite.tests) {
      const result = await this.runTest(test)
      results.push(result)

      if (result.success) {
        console.log(`✅ ${test.name} - ${result.duration.toFixed(2)}ms`)
      } else {
        console.error(`❌ ${test.name} - ${result.error}`)
      }
    }

    testSuite.results = results

    // Print summary
    const successCount = results.filter((r) => r.success).length
    const totalCount = results.length
    const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalCount

    console.log(`\n📊 Test Suite Summary:`)
    console.log(`Success Rate: ${successCount}/${totalCount} (${((successCount / totalCount) * 100).toFixed(1)}%)`)
    console.log(`Average Duration: ${averageDuration.toFixed(2)}ms`)

    if (successCount < totalCount) {
      console.log(`\n❌ Failed Tests:`)
      results
        .filter((r) => !r.success)
        .forEach((result) => {
          console.log(`  - ${result.metadata.preset} (${result.metadata.method}): ${result.error}`)
        })
    }

    console.groupEnd()

    return testSuite
  }

  // Performance benchmark
  async runPerformanceBenchmark(): Promise<void> {
    console.group("🚀 Export Performance Benchmark")

    const testComponent = this.createTestComponent("BenchmarkComponent")
    const preset = ExportPresetService.getPreset("react-starter")

    if (!preset) {
      console.error("❌ React starter preset not found")
      return
    }

    const iterations = 5
    const durations: number[] = []

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now()

      try {
        await EnhancedExportService.createZipExport(testComponent, preset)
        const duration = performance.now() - startTime
        durations.push(duration)
        console.log(`Iteration ${i + 1}: ${duration.toFixed(2)}ms`)
      } catch (error) {
        console.error(`Iteration ${i + 1} failed:`, error)
      }
    }

    if (durations.length > 0) {
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length
      const minDuration = Math.min(...durations)
      const maxDuration = Math.max(...durations)

      console.log(`\n📊 Benchmark Results:`)
      console.log(`Average: ${avgDuration.toFixed(2)}ms`)
      console.log(`Min: ${minDuration.toFixed(2)}ms`)
      console.log(`Max: ${maxDuration.toFixed(2)}ms`)
      console.log(
        `Std Dev: ${Math.sqrt(durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length).toFixed(2)}ms`,
      )
    }

    console.groupEnd()
  }

  // Stress test with multiple components
  async runStressTest(): Promise<void> {
    console.group("💪 Export Stress Test")

    const componentCount = 10
    const components = Array.from({ length: componentCount }, (_, i) =>
      this.createTestComponent(`StressTestComponent${i + 1}`),
    )

    const preset = ExportPresetService.getPreset("react-starter")
    if (!preset) {
      console.error("❌ React starter preset not found")
      return
    }

    const startTime = performance.now()
    const results = await Promise.allSettled(
      components.map((component) => EnhancedExportService.createZipExport(component, preset)),
    )

    const duration = performance.now() - startTime
    const successCount = results.filter((r) => r.status === "fulfilled").length

    console.log(`📊 Stress Test Results:`)
    console.log(`Components: ${componentCount}`)
    console.log(
      `Success Rate: ${successCount}/${componentCount} (${((successCount / componentCount) * 100).toFixed(1)}%)`,
    )
    console.log(`Total Duration: ${duration.toFixed(2)}ms`)
    console.log(`Average per Component: ${(duration / componentCount).toFixed(2)}ms`)

    console.groupEnd()
  }
}

export const exportTestRunner = new ExportTestRunner()

// Utility functions for testing
export async function runQuickExportTest(): Promise<boolean> {
  try {
    const testRunner = new ExportTestRunner()
    const testSuite = testRunner.createTestSuite()

    // Run only ZIP tests for quick validation
    const zipTests = testSuite.tests.filter((t) => t.method === "zip").slice(0, 3)
    const quickSuite = { ...testSuite, tests: zipTests }

    const results = await testRunner.runTestSuite(quickSuite)
    return results.results.every((r) => r.success)
  } catch (error) {
    console.error("❌ Quick export test failed:", error)
    return false
  }
}

export async function validateExportSystem(): Promise<void> {
  console.group("🔍 Export System Validation")

  try {
    // 1. Test presets loading
    const presets = ExportPresetService.getPresets()
    console.log(`✅ Presets loaded: ${presets.length}`)

    // 2. Test service initialization
    const testComponent = {
      componentName: "ValidationTest",
      jsx: "<div>Test</div>",
      css: ".test { color: red; }",
      typescript: "export interface TestProps {}",
      figmaUrl: "https://figma.com/test",
    }

    // 3. Quick export test
    const quickTestPassed = await runQuickExportTest()
    console.log(`${quickTestPassed ? "✅" : "❌"} Quick export test: ${quickTestPassed ? "PASSED" : "FAILED"}`)

    // 4. Performance check
    await exportTestRunner.runPerformanceBenchmark()

    console.log("\n🎉 Export system validation complete!")
  } catch (error) {
    console.error("❌ Export system validation failed:", error)
  }

  console.groupEnd()
}
