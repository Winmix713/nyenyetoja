import { figmaApiClient } from "@/lib/figma-api-client"
import { FigmaNodeParser } from "./figma-node-parser"
import { FigmaImageService } from "./figma-image-service"
import { FigmaComponentAnalyzer } from "./figma-component-analyzer"
import type { ParsedDocument, ComponentAnalysis } from "./figma-node-parser"
import type { OptimizedImageMap } from "./figma-image-service"

export interface BatchProcessingOptions {
  includeImages?: boolean
  optimizeImages?: boolean
  analyzeComponents?: boolean
  generateCSS?: boolean
  maxConcurrency?: number
  onProgress?: (progress: BatchProgress) => void
  onError?: (error: BatchError) => void
}

export interface BatchProgress {
  stage: "fetching" | "parsing" | "images" | "analysis" | "complete"
  progress: number
  message: string
  details?: any
}

export interface BatchError {
  stage: string
  error: Error
  recoverable: boolean
}

export interface BatchProcessingResult {
  document: ParsedDocument
  images?: OptimizedImageMap
  analysis?: ComponentAnalysis[]
  css?: string
  metadata: ProcessingMetadata
}

export interface ProcessingMetadata {
  startTime: Date
  endTime: Date
  duration: number
  stages: StageMetadata[]
  errors: BatchError[]
  performance: PerformanceMetrics
}

export interface StageMetadata {
  name: string
  startTime: Date
  endTime: Date
  duration: number
  success: boolean
  details?: any
}

export interface PerformanceMetrics {
  apiCalls: number
  cacheHits: number
  memoryUsage: number
  processingSpeed: number
}

export class FigmaBatchProcessor {
  private static readonly DEFAULT_CONCURRENCY = 3
  private static readonly STAGE_WEIGHTS = {
    fetching: 0.2,
    parsing: 0.3,
    images: 0.3,
    analysis: 0.2,
  }

  static async processFile(fileKey: string, options: BatchProcessingOptions = {}): Promise<BatchProcessingResult> {
    const startTime = new Date()
    const stages: StageMetadata[] = []
    const errors: BatchError[] = []
    let currentProgress = 0

    const updateProgress = (stage: BatchProgress["stage"], progress: number, message: string, details?: any) => {
      const stageWeight = this.STAGE_WEIGHTS[stage] || 0.25
      const stageProgress = progress * stageWeight
      currentProgress = this.calculateTotalProgress(stage, stageProgress)

      options.onProgress?.({
        stage,
        progress: currentProgress,
        message,
        details,
      })
    }

    const handleError = (stage: string, error: Error, recoverable = true) => {
      const batchError: BatchError = { stage, error, recoverable }
      errors.push(batchError)
      options.onError?.(batchError)

      if (!recoverable) {
        throw error
      }
    }

    try {
      // Stage 1: Fetch file data
      updateProgress("fetching", 0, "Fetching Figma file...")
      const stageStart = new Date()

      const fileData = await figmaApiClient.getFile(fileKey)

      stages.push({
        name: "fetching",
        startTime: stageStart,
        endTime: new Date(),
        duration: Date.now() - stageStart.getTime(),
        success: true,
        details: { fileName: fileData.name, nodeCount: this.countNodes(fileData.document) },
      })

      updateProgress("fetching", 100, `Fetched file: ${fileData.name}`)

      // Stage 2: Parse document structure
      updateProgress("parsing", 0, "Parsing document structure...")
      const parseStart = new Date()

      const document = FigmaNodeParser.parseDocument(fileData.document)

      stages.push({
        name: "parsing",
        startTime: parseStart,
        endTime: new Date(),
        duration: Date.now() - parseStart.getTime(),
        success: true,
        details: {
          pages: document.pages.length,
          components: document.components.length,
          complexity: document.metadata.complexity,
        },
      })

      updateProgress("parsing", 100, `Parsed ${document.metadata.totalNodes} nodes`)

      let images: OptimizedImageMap | undefined
      let analysis: ComponentAnalysis[] | undefined
      let css: string | undefined

      // Stage 3: Process images (if requested)
      if (options.includeImages) {
        updateProgress("images", 0, "Processing images...")
        const imageStart = new Date()

        try {
          const imageNodes = this.extractImageNodes(document)

          if (imageNodes.length > 0) {
            const rawImages = await FigmaImageService.getNodeImages(fileKey, imageNodes)

            if (options.optimizeImages) {
              images = await FigmaImageService.optimizeImages(rawImages, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 85,
                convertToBase64: false,
              })
            } else {
              images = Object.fromEntries(
                Object.entries(rawImages).map(([id, url]) => [
                  id,
                  {
                    url,
                    width: 0,
                    height: 0,
                    format: "unknown",
                    size: 0,
                    optimized: false,
                  },
                ]),
              )
            }
          }

          stages.push({
            name: "images",
            startTime: imageStart,
            endTime: new Date(),
            duration: Date.now() - imageStart.getTime(),
            success: true,
            details: { imageCount: Object.keys(images || {}).length },
          })

          updateProgress("images", 100, `Processed ${Object.keys(images || {}).length} images`)
        } catch (error) {
          handleError("images", error as Error, true)
          stages.push({
            name: "images",
            startTime: imageStart,
            endTime: new Date(),
            duration: Date.now() - imageStart.getTime(),
            success: false,
          })
        }
      }

      // Stage 4: Analyze components (if requested)
      if (options.analyzeComponents) {
        updateProgress("analysis", 0, "Analyzing components...")
        const analysisStart = new Date()

        try {
          analysis = FigmaComponentAnalyzer.analyzeComponents(document)

          stages.push({
            name: "analysis",
            startTime: analysisStart,
            endTime: new Date(),
            duration: Date.now() - analysisStart.getTime(),
            success: true,
            details: { componentCount: analysis.length },
          })

          updateProgress("analysis", 100, `Analyzed ${analysis.length} components`)
        } catch (error) {
          handleError("analysis", error as Error, true)
          stages.push({
            name: "analysis",
            startTime: analysisStart,
            endTime: new Date(),
            duration: Date.now() - analysisStart.getTime(),
            success: false,
          })
        }
      }

      // Generate CSS (if requested)
      if (options.generateCSS) {
        css = this.generateDocumentCSS(document)
      }

      const endTime = new Date()
      const duration = endTime.getTime() - startTime.getTime()

      updateProgress("complete", 100, "Processing complete!")

      return {
        document,
        images,
        analysis,
        css,
        metadata: {
          startTime,
          endTime,
          duration,
          stages,
          errors,
          performance: this.calculatePerformanceMetrics(stages, duration),
        },
      }
    } catch (error) {
      handleError("processing", error as Error, false)
      throw error
    }
  }

  private static calculateTotalProgress(currentStage: string, stageProgress: number): number {
    const stageOrder = ["fetching", "parsing", "images", "analysis"]
    const currentIndex = stageOrder.indexOf(currentStage)

    let totalProgress = 0

    // Add completed stages
    for (let i = 0; i < currentIndex; i++) {
      totalProgress += this.STAGE_WEIGHTS[stageOrder[i] as keyof typeof this.STAGE_WEIGHTS] * 100
    }

    // Add current stage progress
    totalProgress += stageProgress

    return Math.min(totalProgress, 100)
  }

  private static countNodes(node: any): number {
    let count = 1
    if (node.children) {
      count += node.children.reduce((sum: number, child: any) => sum + this.countNodes(child), 0)
    }
    return count
  }

  private static extractImageNodes(document: ParsedDocument): string[] {
    const imageNodes: string[] = []

    const traverseElements = (elements: any[]) => {
      elements.forEach((element) => {
        if (element.type === "image" || element.imageUrl) {
          imageNodes.push(element.id)
        }
        if (element.children) {
          traverseElements(element.children)
        }
      })
    }

    document.pages.forEach((page) => {
      page.frames.forEach((frame) => {
        traverseElements(frame.children)
      })
    })

    return imageNodes
  }

  private static generateDocumentCSS(document: ParsedDocument): string {
    let css = `/* Generated CSS for ${document.name} */\n\n`

    document.pages.forEach((page) => {
      css += `/* Page: ${page.name} */\n`
      page.frames.forEach((frame) => {
        css += this.generateFrameCSS(frame)
      })
      css += "\n"
    })

    return css
  }

  private static generateFrameCSS(frame: any): string {
    let css = ""

    const className = `.${frame.name.toLowerCase().replace(/\s+/g, "-")}`
    css += `${className} {\n`

    Object.entries(frame.styles).forEach(([property, value]) => {
      if (value !== undefined) {
        const cssProperty = this.camelToKebab(property)
        css += `  ${cssProperty}: ${value};\n`
      }
    })

    css += "}\n\n"

    // Generate CSS for children
    if (frame.children) {
      frame.children.forEach((child: any) => {
        if (child.type === "frame") {
          css += this.generateFrameCSS(child)
        }
      })
    }

    return css
  }

  private static camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase()
  }

  private static calculatePerformanceMetrics(stages: StageMetadata[], totalDuration: number): PerformanceMetrics {
    const apiCalls = stages.filter((s) => s.name === "fetching").length
    const cacheHits = 0 // Would need to track from cache
    const memoryUsage = 0 // Would need to measure actual memory usage
    const processingSpeed =
      stages.reduce((sum, stage) => sum + (stage.details?.nodeCount || 0), 0) / (totalDuration / 1000)

    return {
      apiCalls,
      cacheHits,
      memoryUsage,
      processingSpeed,
    }
  }

  // Utility method for processing multiple files
  static async processMultipleFiles(
    fileKeys: string[],
    options: BatchProcessingOptions = {},
  ): Promise<BatchProcessingResult[]> {
    const concurrency = options.maxConcurrency || this.DEFAULT_CONCURRENCY
    const results: BatchProcessingResult[] = []

    // Process files in batches
    for (let i = 0; i < fileKeys.length; i += concurrency) {
      const batch = fileKeys.slice(i, i + concurrency)
      const batchPromises = batch.map((fileKey) => this.processFile(fileKey, options))

      try {
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      } catch (error) {
        console.error(`❌ Failed to process batch starting at index ${i}:`, error)
        // Continue with next batch
      }
    }

    return results
  }
}
