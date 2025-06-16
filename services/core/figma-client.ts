import { CacheManager } from '@/lib/cache/cache-manager'
import { ErrorHandler } from '@/lib/errors/error-handler'
import { TokenEncryption } from '@/lib/security/token-encryption'

export interface FigmaConfig {
  apiBaseUrl: string
  token?: string
  cacheEnabled: boolean
  rateLimitEnabled: boolean
  timeout: number
}

export interface FigmaFileResponse {
  document: FigmaNode
  components: Record<string, FigmaComponent>
  schemaVersion: number
  styles: Record<string, FigmaStyle>
  name: string
  lastModified: string
  thumbnailUrl?: string
  version: string
}

export interface FigmaNode {
  id: string
  name: string
  type: string
  children?: FigmaNode[]
  [key: string]: any
}

export interface FigmaComponent {
  key: string
  name: string
  description: string
  documentationLinks: FigmaDocumentationLink[]
}

export interface FigmaStyle {
  key: string
  name: string
  description: string
  styleType: string
}

export interface FigmaDocumentationLink {
  uri: string
}

export interface FigmaUser {
  id: string
  email: string
  handle: string
  imgUrl: string
}

export interface ConnectionResult {
  success: boolean
  user?: FigmaUser
  error?: string
}

export class FigmaClient {
  private static instance: FigmaClient
  private config: FigmaConfig
  private cache: CacheManager

  private constructor(config: Partial<FigmaConfig> = {}) {
    this.config = {
      apiBaseUrl: 'https://api.figma.com/v1',
      cacheEnabled: true,
      rateLimitEnabled: true,
      timeout: 30000,
      ...config
    }
    this.cache = CacheManager.getInstance()
  }

  static getInstance(config?: Partial<FigmaConfig>): FigmaClient {
    if (!FigmaClient.instance) {
      FigmaClient.instance = new FigmaClient(config)
    }
    return FigmaClient.instance
  }

  /**
   * Set or update the Figma access token
   */
  setToken(token: string): void {
    this.config.token = TokenEncryption.encrypt(token)
  }

  /**
   * Get the decrypted token
   */
  private getToken(): string {
    if (!this.config.token) {
      throw new Error('No Figma token configured. Please set a token using setToken()')
    }
    return TokenEncryption.decrypt(this.config.token)
  }

  /**
   * Test the connection to Figma API
   */
  async testConnection(): Promise<ConnectionResult> {
    try {
      const user = await this.getUser()
      return { success: true, user }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed'
      ErrorHandler.handle(error as Error, 'FigmaClient.testConnection')
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get current user information
   */
  async getUser(): Promise<FigmaUser> {
    const cacheKey = 'figma-user'
    
    if (this.config.cacheEnabled) {
      const cachedUser = await this.cache.get<FigmaUser>(cacheKey)
      if (cachedUser) {
        return cachedUser
      }
    }

    const response = await this.makeRequest<FigmaUser>('/me')
    
    if (this.config.cacheEnabled) {
      await this.cache.set(cacheKey, response, 300) // 5 minutes cache
    }

    return response
  }

  /**
   * Get a Figma file
   */
  async getFile(fileKey: string): Promise<FigmaFileResponse> {
    const cacheKey = `figma-file-${fileKey}`
    
    if (this.config.cacheEnabled) {
      const cachedFile = await this.cache.get<FigmaFileResponse>(cacheKey)
      if (cachedFile) {
        return cachedFile
      }
    }

    const response = await this.makeRequest<FigmaFileResponse>(`/files/${fileKey}`)
    
    if (this.config.cacheEnabled) {
      await this.cache.set(cacheKey, response, 3600) // 1 hour cache
    }

    return response
  }

  /**
   * Get file nodes
   */
  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<any> {
    const nodeIdString = nodeIds.join(',')
    const cacheKey = `figma-nodes-${fileKey}-${btoa(nodeIdString)}`
    
    if (this.config.cacheEnabled) {
      const cachedNodes = await this.cache.get(cacheKey)
      if (cachedNodes) {
        return cachedNodes
      }
    }

    const response = await this.makeRequest(`/files/${fileKey}/nodes?ids=${nodeIdString}`)
    
    if (this.config.cacheEnabled) {
      await this.cache.set(cacheKey, response, 3600)
    }

    return response
  }

  /**
   * Get file images
   */
  async getFileImages(fileKey: string, nodeIds: string[], options: any = {}): Promise<any> {
    const nodeIdString = nodeIds.join(',')
    const params = new URLSearchParams({
      ids: nodeIdString,
      format: options.format || 'png',
      scale: options.scale || '1',
      ...options
    })

    return this.makeRequest(`/images/${fileKey}?${params}`)
  }

  /**
   * Extract file key from Figma URL
   */
  static extractFileKey(url: string): string | null {
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

  /**
   * Validate a Figma URL
   */
  async validateUrl(url: string): Promise<{ valid: boolean; fileKey?: string; error?: string }> {
    try {
      const fileKey = FigmaClient.extractFileKey(url)
      
      if (!fileKey) {
        return {
          valid: false,
          error: 'Invalid Figma URL format. Please provide a valid Figma file or design URL.'
        }
      }

      // Test if file is accessible
      await this.getFile(fileKey)

      return { valid: true, fileKey }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to validate Figma URL'
      }
    }
  }

  /**
   * Make an authenticated request to Figma API
   */
  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.config.apiBaseUrl}${endpoint}`
    const token = this.getToken()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        headers: {
          'X-Figma-Token': token,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Figma API error: ${response.status} ${response.statusText}. ${errorData.message || ''}`
        )
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      ErrorHandler.handle(error as Error, 'FigmaClient.makeRequest')
      throw error
    }
  }

  /**
   * Clear cache for a specific file
   */
  async clearFileCache(fileKey: string): Promise<void> {
    const cacheKey = `figma-file-${fileKey}`
    await this.cache.delete(cacheKey)
  }

  /**
   * Clear all Figma-related cache
   */
  async clearAllCache(): Promise<void> {
    await this.cache.clear('figma-')
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    return this.cache.getStats()
  }
}

export const figmaClient = FigmaClient.getInstance()