interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

interface CacheStats {
  size: number
  maxSize: number
  hitRate: number
  missRate: number
  totalHits: number
  totalMisses: number
}

export class FigmaCache {
  private static instance: FigmaCache
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize: number
  private defaultTtl: number
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  }

  constructor(maxSize = 100, defaultTtl = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.defaultTtl = defaultTtl
  }

  static getInstance(): FigmaCache {
    if (!FigmaCache.instance) {
      FigmaCache.instance = new FigmaCache()
    }
    return FigmaCache.instance
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return null
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = now
    this.stats.hits++

    return entry.value
  }

  set<T>(key: string, value: T, customTtl?: number): void {
    const now = Date.now()
    const ttl = customTtl || this.defaultTtl

    // Evict old entries if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLeastRecentlyUsed()
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
    })

    this.stats.sets++
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey = ""
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.deletes++
    }
  }

  invalidate(pattern: string): number {
    let deletedCount = 0
    const regex = new RegExp(pattern)

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deletedCount++
        this.stats.deletes++
      }
    }

    return deletedCount
  }

  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    this.stats.deletes += size
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
    }
  }

  // Cleanup expired entries
  cleanup(): number {
    const now = Date.now()
    let deletedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        deletedCount++
        this.stats.deletes++
      }
    }

    return deletedCount
  }
}
