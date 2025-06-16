import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ExportPanel } from "@/components/export-panel"
import type { ExportData } from "@/services/export-service"

const mockExportData: ExportData = {
  jsx: "export default function TestComponent() { return <div>Test</div> }",
  css: ".test { color: red; }",
  typescript: "export interface TestProps { className?: string; }",
  componentName: "TestComponent",
  figmaUrl: "https://figma.com/test",
  metadata: {
    generatedAt: "2024-01-01T00:00:00Z",
    version: "1.0.0",
    figmaFile: "test-file",
  },
}

describe("ExportPanel", () => {
  it("renders export options", () => {
    render(<ExportPanel exportData={mockExportData} />)

    expect(screen.getByText("Export Opciók")).toBeInTheDocument()
    expect(screen.getByText("ZIP Letöltés")).toBeInTheDocument()
    expect(screen.getByText("GitHub Export")).toBeInTheDocument()
  })

  it("shows project structure in ZIP tab", () => {
    render(<ExportPanel exportData={mockExportData} />)

    expect(screen.getByText("Projekt Struktúra")).toBeInTheDocument()
    expect(screen.getByText("TestComponent.tsx")).toBeInTheDocument()
    expect(screen.getByText("TestComponent.types.ts")).toBeInTheDocument()
  })

  it("requires GitHub token and repo name for GitHub export", async () => {
    render(<ExportPanel exportData={mockExportData} />)

    // Switch to GitHub tab
    fireEvent.click(screen.getByText("GitHub Export"))

    const exportButton = screen.getByText("GitHub-ra Feltöltés")
    expect(exportButton).toBeDisabled()

    // Fill in required fields
    const tokenInput = screen.getByPlaceholderText("ghp_xxxxxxxxxxxxxxxxxxxx")
    const repoInput = screen.getByPlaceholderText("my-figma-component")

    fireEvent.change(tokenInput, { target: { value: "test-token" } })
    fireEvent.change(repoInput, { target: { value: "test-repo" } })

    expect(exportButton).not.toBeDisabled()
  })
})
