/**
 * Advanced Caching Strategy for KCISLK ESID Info Hub
 * 高效能快取策略 - 優化 API 回應時間
 * 
 * Features:
 * - In-memory caching with TTL
 * - Query result caching
 * - Cache invalidation strategies
 * - Performance monitoring
 */

import { performance } from 'perf_hooks'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hitCount: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
}

export class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0
  }
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
    
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Get cached data with performance tracking
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.evictions++
      return null
    }

    // Update access statistics
    entry.hitCount++
    entry.lastAccessed = Date.now()
    this.stats.hits++
    
    return entry.data
  }

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      hitCount: 0,
      lastAccessed: Date.now()
    }

    this.cache.set(key, entry)
    this.stats.sets++
  }

  /**
   * Delete cached entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
    }
    return deleted
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear()
    this.stats.deletes += this.cache.size
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { size: number; hitRate: number } {
    const totalRequests = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let deleted = 0
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }
    this.stats.deletes += deleted
    return deleted
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
    }
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.stats.evictions += cleaned
      console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`)
    }
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.clear()
  }
}

// Global cache instance
export const cache = new PerformanceCache(2000)

/**
 * Cache wrapper for async functions with automatic key generation
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs = 5 * 60 * 1000
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Cache miss - fetch data
  const start = performance.now()
  const data = await fetchFn()
  const duration = performance.now() - start

  // Log slow operations
  if (duration > 100) {
    console.warn(`⚡ Slow cache miss for '${key}': ${duration.toFixed(2)}ms`)
  }

  // Cache the result
  cache.set(key, data, ttlMs)
  
  return data
}

/**
 * Cache invalidation helpers for common patterns
 */
export const cacheInvalidation = {
  announcements: () => cache.invalidatePattern(/^announcements:/),
  events: () => cache.invalidatePattern(/^events:/),
  resources: () => cache.invalidatePattern(/^resources:/),
  users: () => cache.invalidatePattern(/^users:/),
  all: () => cache.clear()
}

/**
 * Common cache TTLs
 */
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes  
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
  STATIC: 24 * 60 * 60 * 1000 // 24 hours
}

// Log cache statistics periodically in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const stats = cache.getStats()
    if (stats.hits + stats.misses > 0) {
      console.log(
        `📊 Cache Stats: ${stats.hits}H/${stats.misses}M (${stats.hitRate.toFixed(1)}% hit rate), Size: ${stats.size}`
      )
    }
  }, 60000) // Every minute
}

// Cleanup on process exit
process.on('exit', () => {
  cache.destroy()
})