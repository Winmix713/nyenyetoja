export interface ParsedFigmaUrl {
  fileKey: string
  nodeId?: string
  fileName?: string
  isValid: boolean
  originalUrl: string
}

export class FigmaUrlParser {
  private static readonly FIGMA_URL_PATTERNS = [
    // Standard Figma file URL
    /^https:\/\/(?:www\.)?figma\.com\/file\/([a-zA-Z0-9]+)\/([^/?]+)(?:\?.*)?(?:#(.+))?$/,
    // Figma file URL with node ID
    /^https:\/\/(?:www\.)?figma\.com\/file\/([a-zA-Z0-9]+)\/[^/?]+\?.*node-id=([^&]+).*$/,
    // Figma prototype URL
    /^https:\/\/(?:www\.)?figma\.com\/proto\/([a-zA-Z0-9]+)\/([^/?]+)(?:\?.*)?$/,
    // Figma design URL (alternative format)
    /^https:\/\/(?:www\.)?figma\.com\/design\/([a-zA-Z0-9]+)\/([^/?]+)(?:\?.*)?(?:#(.+))?$/,
  ]

  static parse(url: string): ParsedFigmaUrl {
    const trimmedUrl = url.trim()

    for (const pattern of this.FIGMA_URL_PATTERNS) {
      const match = trimmedUrl.match(pattern)
      if (match) {
        const [, fileKey, fileName, nodeId] = match

        return {
          fileKey,
          nodeId: nodeId ? decodeURIComponent(nodeId) : undefined,
          fileName: fileName ? decodeURIComponent(fileName.replace(/-/g, " ")) : undefined,
          isValid: true,
          originalUrl: trimmedUrl,
        }
      }
    }

    return {
      fileKey: "",
      isValid: false,
      originalUrl: trimmedUrl,
    }
  }

  static extractFileKey(url: string): string | null {
    const parsed = this.parse(url)
    return parsed.isValid ? parsed.fileKey : null
  }

  static isValidFigmaUrl(url: string): boolean {
    return this.parse(url).isValid
  }

  static generateFileUrl(fileKey: string, fileName?: string): string {
    const encodedFileName = fileName ? encodeURIComponent(fileName.replace(/\s+/g, "-")) : "Untitled"
    return `https://www.figma.com/file/${fileKey}/${encodedFileName}`
  }

  static generateNodeUrl(fileKey: string, nodeId: string, fileName?: string): string {
    const baseUrl = this.generateFileUrl(fileKey, fileName)
    const encodedNodeId = encodeURIComponent(nodeId)
    return `${baseUrl}?node-id=${encodedNodeId}`
  }
}
