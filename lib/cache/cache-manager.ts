export interface CacheEntry<T = any> {
  data: T
  expires: number
  size: number
}

export interface CacheStats {
  size: number
  hitRate: number
  entries: number
  memoryUsage: number
}

export class CacheManager {
  private static instance: CacheManager
  private cache = new Map<string, CacheEntry>()
  private hits = 0
  private misses = 0

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * Get an item from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.misses++
      return null
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.misses++
      return null
    }

    this.hits++
    return entry.data as T
  }

  /**
   * Set an item in cache
   */
  async set<T>(key: string, data: T, ttl = 3600): Promise<void> {
    const size = this.calculateSize(data)
    const entry: CacheEntry<T> = {
      data,
      expires: Date.now() + (ttl * 1000),
      size
    }

    this.cache.set(key, entry)
    this.cleanup()
  }

  /**
   * Delete an item from cache
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  /**
   * Clear cache entries matching a prefix
   */
  async clear(prefix?: string): Promise<void> {
    if (!prefix) {
      this.cache.clear()
      return
    }

    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.startsWith(prefix)
    )

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Check if cache entry exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    return entry ? !this.isExpired(entry) : false
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    let totalSize = 0
    let validEntries = 0

    for (const entry of this.cache.values()) {
      if (!this.isExpired(entry)) {
        totalSize += entry.size
        validEntries++
      }
    }

    const totalRequests = this.hits + this.misses
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0

    return {
      size: totalSize,
      hitRate,
      entries: validEntries,
      memoryUsage: process.memoryUsage?.().heapUsed || 0
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))

    // If cache is getting too large, remove oldest entries
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].expires - b[1].expires)
      
      const toRemove = entries.slice(0, 100)
      toRemove.forEach(([key]) => this.cache.delete(key))
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return entry.expires < Date.now()
  }

  /**
   * Calculate approximate size of data
   */
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length
    } catch {
      return 1000 // fallback size estimate
    }
  }
}

export const cacheManager = CacheManager.getInstance()