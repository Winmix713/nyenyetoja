import { figmaApiClient } from "@/lib/figma-api-client"
import type { FigmaNode } from "@/lib/figma-api-types"
import { FigmaCache } from "@/lib/figma-cache"

export interface ImageMap {
  [nodeId: string]: string
}

export interface OptimizedImageMap {
  [nodeId: string]: OptimizedImage
}

export interface OptimizedImage {
  url: string
  base64?: string
  width: number
  height: number
  format: string
  size: number
  optimized: boolean
}

export interface PlaceholderMap {
  [nodeId: string]: string
}

export interface ImageProcessingOptions {
  format?: "jpg" | "png" | "svg" | "pdf"
  scale?: number
  quality?: number
  maxWidth?: number
  maxHeight?: number
  convertToBase64?: boolean
  generatePlaceholders?: boolean
}

export class FigmaImageService {
  private static cache = FigmaCache.getInstance()
  private static readonly MAX_BATCH_SIZE = 50
  private static readonly DEFAULT_TIMEOUT = 30000

  static async getNodeImages(
    fileKey: string,
    nodeIds: string[],
    options: ImageProcessingOptions = {},
  ): Promise<ImageMap> {
    console.log(`🖼️ Processing ${nodeIds.length} images...`)

    const { format = "png", scale = 1 } = options

    // Process in batches to avoid API limits
    const batches = this.createBatches(nodeIds, this.MAX_BATCH_SIZE)
    const allImages: ImageMap = {}

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} images)`)

      try {
        const batchImages = await this.processBatch(fileKey, batch, { format, scale })
        Object.assign(allImages, batchImages)
      } catch (error) {
        console.error(`❌ Failed to process batch ${i + 1}:`, error)

        // Generate placeholders for failed batch
        if (options.generatePlaceholders) {
          const placeholders = this.generateBatchPlaceholders(batch)
          Object.assign(allImages, placeholders)
        }
      }

      // Add delay between batches to respect rate limits
      if (i < batches.length - 1) {
        await this.delay(1000)
      }
    }

    console.log(`✅ Successfully processed ${Object.keys(allImages).length}/${nodeIds.length} images`)
    return allImages
  }

  private static async processBatch(
    fileKey: string,
    nodeIds: string[],
    options: { format: string; scale: number },
  ): Promise<ImageMap> {
    const cacheKey = `batch:${fileKey}:${nodeIds.join(",")}:${JSON.stringify(options)}`

    // Check cache first
    const cached = this.cache.get<ImageMap>(cacheKey)
    if (cached) {
      console.log(`📦 Cache hit for batch of ${nodeIds.length} images`)
      return cached
    }

    const response = await figmaApiClient.getImages(fileKey, nodeIds, {
      format: options.format as any,
      scale: options.scale,
    })

    if (response.err) {
      throw new Error(`Figma API error: ${response.err}`)
    }

    // Cache the result
    this.cache.set(cacheKey, response.images, 15 * 60 * 1000) // 15 minutes

    return response.images
  }

  static async optimizeImages(images: ImageMap, options: ImageProcessingOptions = {}): Promise<OptimizedImageMap> {
    console.log(`🔧 Optimizing ${Object.keys(images).length} images...`)

    const { maxWidth = 1920, maxHeight = 1080, quality = 85, convertToBase64 = false } = options

    const optimizedImages: OptimizedImageMap = {}
    const promises = Object.entries(images).map(async ([nodeId, url]) => {
      try {
        const optimized = await this.optimizeImage(url, {
          maxWidth,
          maxHeight,
          quality,
          convertToBase64,
        })
        optimizedImages[nodeId] = optimized
      } catch (error) {
        console.error(`❌ Failed to optimize image ${nodeId}:`, error)

        // Fallback to original
        optimizedImages[nodeId] = {
          url,
          width: 0,
          height: 0,
          format: "unknown",
          size: 0,
          optimized: false,
        }
      }
    })

    await Promise.all(promises)
    console.log(`✅ Optimized ${Object.keys(optimizedImages).length} images`)

    return optimizedImages
  }

  private static async optimizeImage(
    url: string,
    options: {
      maxWidth: number
      maxHeight: number
      quality: number
      convertToBase64: boolean
    },
  ): Promise<OptimizedImage> {
    const cacheKey = `optimized:${url}:${JSON.stringify(options)}`
    const cached = this.cache.get<OptimizedImage>(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch image metadata
    const response = await fetch(url, { method: "HEAD" })
    const contentLength = response.headers.get("content-length")
    const contentType = response.headers.get("content-type")

    const optimized: OptimizedImage = {
      url,
      width: 0,
      height: 0,
      format: this.getFormatFromContentType(contentType),
      size: contentLength ? Number.parseInt(contentLength) : 0,
      optimized: false,
    }

    // Get image dimensions
    try {
      const dimensions = await this.getImageDimensions(url)
      optimized.width = dimensions.width
      optimized.height = dimensions.height
    } catch (error) {
      console.warn(`⚠️ Could not get dimensions for image: ${url}`)
    }

    // Convert to base64 if requested
    if (options.convertToBase64) {
      try {
        optimized.base64 = await this.convertToBase64(url)
      } catch (error) {
        console.warn(`⚠️ Could not convert to base64: ${url}`)
      }
    }

    // Cache the result
    this.cache.set(cacheKey, optimized, 30 * 60 * 1000) // 30 minutes

    return optimized
  }

  static async convertToBase64(imageUrl: string): Promise<string> {
    const cacheKey = `base64:${imageUrl}`
    const cached = this.cache.get<string>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          this.cache.set(cacheKey, base64, 60 * 60 * 1000) // 1 hour
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error}`)
    }
  }

  static generateImagePlaceholders(nodes: FigmaNode[]): PlaceholderMap {
    const placeholders: PlaceholderMap = {}

    nodes.forEach((node) => {
      if (this.isImageNode(node)) {
        placeholders[node.id] = this.generatePlaceholder(node)
      }
    })

    return placeholders
  }

  private static generateBatchPlaceholders(nodeIds: string[]): PlaceholderMap {
    const placeholders: PlaceholderMap = {}

    nodeIds.forEach((nodeId) => {
      placeholders[nodeId] = this.generateGenericPlaceholder()
    })

    return placeholders
  }

  private static generatePlaceholder(node: FigmaNode): string {
    const bounds = "absoluteBoundingBox" in node ? node.absoluteBoundingBox : { width: 200, height: 150 }
    const width = bounds?.width || 200
    const height = bounds?.height || 150

    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="14" fill="#999">
          ${node.name || "Image"}
        </text>
      </svg>
    `)}`
  }

  private static generateGenericPlaceholder(): string {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="14" fill="#999">
          Image
        </text>
      </svg>
    `)}`
  }

  private static async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = reject
      img.src = url
    })
  }

  private static getFormatFromContentType(contentType: string | null): string {
    if (!contentType) return "unknown"

    if (contentType.includes("png")) return "png"
    if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg"
    if (contentType.includes("svg")) return "svg"
    if (contentType.includes("webp")) return "webp"

    return "unknown"
  }

  private static isImageNode(node: FigmaNode): boolean {
    // Check if node has image fills
    if ("fills" in node && node.fills) {
      return node.fills.some((fill) => fill.type === "IMAGE")
    }
    return false
  }

  private static createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize))
    }
    return batches
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Batch processing with progress tracking
  static async processImagesWithProgress(
    fileKey: string,
    nodeIds: string[],
    options: ImageProcessingOptions = {},
    onProgress?: (progress: { completed: number; total: number; percentage: number }) => void,
  ): Promise<OptimizedImageMap> {
    const total = nodeIds.length
    let completed = 0

    const updateProgress = () => {
      completed++
      const percentage = Math.round((completed / total) * 100)
      onProgress?.({ completed, total, percentage })
    }

    // Get raw images
    const images = await this.getNodeImages(fileKey, nodeIds, options)

    // Optimize with progress tracking
    const optimizedImages: OptimizedImageMap = {}
    const promises = Object.entries(images).map(async ([nodeId, url]) => {
      try {
        const optimized = await this.optimizeImage(url, {
          maxWidth: options.maxWidth || 1920,
          maxHeight: options.maxHeight || 1080,
          quality: options.quality || 85,
          convertToBase64: options.convertToBase64 || false,
        })
        optimizedImages[nodeId] = optimized
      } catch (error) {
        console.error(`❌ Failed to optimize image ${nodeId}:`, error)
        optimizedImages[nodeId] = {
          url,
          width: 0,
          height: 0,
          format: "unknown",
          size: 0,
          optimized: false,
        }
      } finally {
        updateProgress()
      }
    })

    await Promise.all(promises)
    return optimizedImages
  }
}
