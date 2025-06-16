"use client"

import { figmaApiClient } from "@/lib/figma-api-client"
import { figmaParser, type ParsedFigmaDesign } from "./figma-parser"
import { aiCodeGenerator, type AICodeGenerationRequest, type AICodeGenerationResult } from "./ai-code-generator"
import { cssGenerator, type CSSGenerationOptions, type GeneratedCSS } from "./css-generator"

export interface EnhancedFigmaProcessingOptions {
  targetFramework: "react" | "vue" | "angular"
  styleFramework: "tailwind" | "css-modules" | "styled-components" | "vanilla-css"
  preferences: {
    typescript: boolean
    responsive: boolean
    accessibility: boolean
    semanticHtml: boolean
    componentSplit: "single" | "multiple" | "auto"
  }
  customInstructions?: string
  cssOptions?: Partial<CSSGenerationOptions>
}

export interface EnhancedFigmaResult {
  design: ParsedFigmaDesign
  code: AICodeGenerationResult
  styles: GeneratedCSS
  metadata: {
    processingTime: number
    figmaFileSize: number
    generatedFiles: number
    qualityScore: number
  }
}

export interface ProcessingProgress {
  stage: "fetching" | "parsing" | "analyzing" | "generating-code" | "generating-css" | "finalizing"
  progress: number
  message: string
  details?: string
}

export class EnhancedFigmaService {
  private progressCallback?: (progress: ProcessingProgress) => void

  setProgressCallback(callback: (progress: ProcessingProgress) => void): void {
    this.progressCallback = callback
  }

  async processDesign(figmaUrl: string, options: EnhancedFigmaProcessingOptions): Promise<EnhancedFigmaResult> {
    console.log(`🚀 Starting enhanced Figma processing for: ${figmaUrl}`)
    const startTime = Date.now()

    try {
      // Step 1: Extract file key and fetch Figma data
      this.updateProgress("fetching", 10, "Fetching Figma file...", "Connecting to Figma API")

      const fileKey = this.extractFileKey(figmaUrl)
      if (!fileKey) {
        throw new Error("Invalid Figma URL. Please provide a valid Figma file or design URL.")
      }

      const figmaFile = await figmaApiClient.getFile(fileKey)

      // Step 2: Parse design structure
      this.updateProgress("parsing", 25, "Parsing design structure...", "Analyzing Figma nodes and components")

      const parsedDesign = figmaParser.parse(figmaFile)

      // Step 3: AI analysis and code generation
      this.updateProgress(
        "analyzing",
        40,
        "AI analyzing design patterns...",
        "Identifying components and layout strategies",
      )

      const codeRequest: AICodeGenerationRequest = {
        design: parsedDesign,
        targetFramework: options.targetFramework,
        styleFramework: options.styleFramework,
        preferences: options.preferences,
        customInstructions: options.customInstructions,
      }

      this.updateProgress("generating-code", 60, "Generating React components...", "Creating optimized component code")

      const generatedCode = await aiCodeGenerator.generateCode(codeRequest)

      // Step 4: Generate CSS
      this.updateProgress("generating-css", 80, "Generating stylesheets...", "Creating responsive CSS styles")

      const cssOptions: CSSGenerationOptions = {
        framework: options.styleFramework === "vanilla-css" ? "vanilla-css" : "tailwind",
        responsive: options.preferences.responsive,
        minify: false,
        includeVariables: true,
        browserSupport: "modern",
        ...options.cssOptions,
      }

      const generatedCSS = cssGenerator.generate(parsedDesign)

      // Step 5: Finalize and package results
      this.updateProgress("finalizing", 95, "Finalizing results...", "Packaging generated files")

      const processingTime = Date.now() - startTime

      const result: EnhancedFigmaResult = {
        design: parsedDesign,
        code: generatedCode,
        styles: generatedCSS,
        metadata: {
          processingTime,
          figmaFileSize: JSON.stringify(figmaFile).length,
          generatedFiles: generatedCode.components.length + generatedCode.styles.length,
          qualityScore: generatedCode.quality.score,
        },
      }

      this.updateProgress(
        "finalizing",
        100,
        "Processing complete!",
        `Generated ${result.metadata.generatedFiles} files in ${processingTime}ms`,
      )

      console.log(`✅ Enhanced Figma processing completed successfully`)
      console.log(`📊 Processing stats:`, result.metadata)

      return result
    } catch (error) {
      console.error(`❌ Enhanced Figma processing failed:`, error)

      this.updateProgress("fetching", 0, "Processing failed", error instanceof Error ? error.message : "Unknown error")

      throw new Error(`Figma processing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async testConnection(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      return await figmaApiClient.testConnection()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Connection test failed",
      }
    }
  }

  async validateFigmaUrl(url: string): Promise<{ valid: boolean; fileKey?: string; error?: string }> {
    try {
      const fileKey = this.extractFileKey(url)

      if (!fileKey) {
        return {
          valid: false,
          error: "Invalid Figma URL format. Please provide a valid Figma file or design URL.",
        }
      }

      // Test if file is accessible
      await figmaApiClient.getFile(fileKey)

      return {
        valid: true,
        fileKey,
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Failed to validate Figma URL",
      }
    }
  }

  async getFilePreview(figmaUrl: string): Promise<{
    name: string
    thumbnail?: string
    lastModified: string
    nodeCount: number
    componentCount: number
  }> {
    const fileKey = this.extractFileKey(figmaUrl)
    if (!fileKey) {
      throw new Error("Invalid Figma URL")
    }

    const figmaFile = await figmaApiClient.getFile(fileKey)
    const parsedDesign = figmaParser.parse(figmaFile)

    return {
      name: figmaFile.name,
      thumbnail: figmaFile.thumbnailUrl,
      lastModified: figmaFile.lastModified,
      nodeCount: parsedDesign.metadata.nodeCount,
      componentCount: parsedDesign.metadata.componentCount,
    }
  }

  private extractFileKey(url: string): string | null {
    // Support multiple Figma URL formats
    const patterns = [
      /figma\.com\/file\/([a-zA-Z0-9]+)/,
      /figma\.com\/design\/([a-zA-Z0-9]+)/,
      /figma\.com\/proto\/([a-zA-Z0-9]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }

  private updateProgress(
    stage: ProcessingProgress["stage"],
    progress: number,
    message: string,
    details?: string,
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        progress,
        message,
        details,
      })
    }
  }

  // Utility methods for error recovery
  async retryWithFallback<T>(operation: () => Promise<T>, fallback: () => T, maxRetries = 3): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error")
        console.warn(`⚠️ Attempt ${attempt} failed:`, lastError.message)

        if (attempt === maxRetries) {
          console.log(`🔄 Using fallback after ${maxRetries} failed attempts`)
          return fallback()
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    throw lastError
  }
}

export const enhancedFigmaService = new EnhancedFigmaService()
