/**
 * Unified Cache Strategy
 * 統一快取策略 - 標準化所有快取操作
 * 
 * Features:
 * - Memory-based caching with TTL
 * - Intelligent cache invalidation
 * - Type-safe cache keys
 * - Performance monitoring
 * - Graceful degradation
 */

import { createHash } from 'crypto'

// 📋 Cache Entry Interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

// 📋 Cache Statistics Interface
interface CacheStats {
  total: number
  hits: number
  misses: number
  hitRate: number
  memoryUsage: number
  entries: Array<{
    key: string
    size: number
    hits: number
    age: number
    ttl: number
  }>
}

// 📋 Cache Configuration
export const CACHE_TTL = {
  SHORT: 60 * 1000,        // 1 minute
  MEDIUM: 5 * 60 * 1000,   // 5 minutes  
  LONG: 15 * 60 * 1000,    // 15 minutes
  HOUR: 60 * 60 * 1000,    // 1 hour
  DAY: 24 * 60 * 60 * 1000 // 1 day
} as const

// 📋 Cache Key Types (Type-safe keys)
export enum CacheKeyType {
  COMMUNICATION = 'comm',
  USER = 'user',
  PERMISSION = 'perm',
  STATS = 'stats',
  API = 'api'
}

// 🏗️ Unified Cache Class
export class UnifiedCache {
  private static instance: UnifiedCache
  private cache = new Map<string, CacheEntry<any>>()
  private stats = {
    hits: 0,
    misses: 0,
    total: 0
  }
  
  // Singleton pattern
  public static getInstance(): UnifiedCache {
    if (!UnifiedCache.instance) {
      UnifiedCache.instance = new UnifiedCache()
    }
    return UnifiedCache.instance
  }
  
  /**
   * Generate cache key
   */
  private generateKey(
    type: CacheKeyType,
    identifier: string,
    params?: Record<string, any>
  ): string {
    let key = `${type}:${identifier}`
    
    if (params && Object.keys(params).length > 0) {
      // Sort params for consistent keys
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((obj, key) => {
          obj[key] = params[key]
          return obj
        }, {} as Record<string, any>)
      
      // Create hash of params
      const paramsHash = createHash('md5')
        .update(JSON.stringify(sortedParams))
        .digest('hex')
        .substring(0, 8)
      
      key += `:${paramsHash}`
    }
    
    return key
  }
  
  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }
  
  /**
   * Calculate memory usage (rough estimate)
   */
  private calculateMemoryUsage(): number {
    let totalSize = 0
    
    for (const [key, entry] of this.cache.entries()) {
      // Rough estimate: key size + JSON stringify of data
      totalSize += key.length * 2 // UTF-16 characters
      totalSize += JSON.stringify(entry.data).length * 2
      totalSize += 64 // Entry metadata overhead
    }
    
    return totalSize
  }
  
  /**
   * Clean expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key)
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key))
  }
  
  /**
   * Set cache entry
   */
  public set<T>(
    type: CacheKeyType,
    identifier: string,
    data: T,
    ttl: number = CACHE_TTL.MEDIUM,
    params?: Record<string, any>
  ): void {
    try {
      const key = this.generateKey(type, identifier, params)
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        hits: 0
      }
      
      this.cache.set(key, entry)
      this.stats.total++
      
      // Periodic cleanup
      if (this.stats.total % 100 === 0) {
        this.cleanup()
      }
      
    } catch (error) {
      console.error('Cache set error:', error)
      // Graceful degradation - don't throw
    }
  }
  
  /**
   * Get cache entry
   */
  public get<T>(
    type: CacheKeyType,
    identifier: string,
    params?: Record<string, any>
  ): T | null {
    try {
      const key = this.generateKey(type, identifier, params)
      const entry = this.cache.get(key)
      
      if (!entry) {
        this.stats.misses++
        return null
      }
      
      // Check expiration
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        this.stats.misses++
        return null
      }
      
      // Update stats
      entry.hits++
      this.stats.hits++
      
      return entry.data as T
      
    } catch (error) {
      console.error('Cache get error:', error)
      this.stats.misses++
      return null
    }
  }
  
  /**
   * Check if key exists and is not expired
   */
  public has(
    type: CacheKeyType,
    identifier: string,
    params?: Record<string, any>
  ): boolean {
    return this.get(type, identifier, params) !== null
  }
  
  /**
   * Delete cache entry
   */
  public delete(
    type: CacheKeyType,
    identifier: string,
    params?: Record<string, any>
  ): boolean {
    try {
      const key = this.generateKey(type, identifier, params)
      return this.cache.delete(key)
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }
  
  /**
   * Clear all entries of a specific type
   */
  public clearType(type: CacheKeyType): number {
    try {
      let cleared = 0
      const keysToDelete: string[] = []
      
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${type}:`)) {
          keysToDelete.push(key)
        }
      }
      
      keysToDelete.forEach(key => {
        if (this.cache.delete(key)) {
          cleared++
        }
      })
      
      return cleared
      
    } catch (error) {
      console.error('Cache clearType error:', error)
      return 0
    }
  }
  
  /**
   * Clear all cache entries
   */
  public clearAll(): void {
    try {
      this.cache.clear()
      this.stats = { hits: 0, misses: 0, total: 0 }
    } catch (error) {
      console.error('Cache clearAll error:', error)
    }
  }
  
  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    try {
      this.cleanup() // Clean before generating stats
      
      const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        size: JSON.stringify(entry.data).length * 2,
        hits: entry.hits,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl
      }))
      
      return {
        total: this.cache.size,
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
        memoryUsage: this.calculateMemoryUsage(),
        entries
      }
      
    } catch (error) {
      console.error('Cache getStats error:', error)
      return {
        total: 0,
        hits: 0,
        misses: 0,
        hitRate: 0,
        memoryUsage: 0,
        entries: []
      }
    }
  }
  
  /**
   * Get or set pattern (cache-aside)
   */
  public async getOrSet<T>(
    type: CacheKeyType,
    identifier: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM,
    params?: Record<string, any>
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(type, identifier, params)
    if (cached !== null) {
      return cached
    }
    
    try {
      // Fetch fresh data
      const data = await fetcher()
      
      // Store in cache
      this.set(type, identifier, data, ttl, params)
      
      return data
      
    } catch (error) {
      console.error('Cache getOrSet fetcher error:', error)
      throw error
    }
  }
}

// 🎯 Convenience Functions for Common Cache Operations

const cache = UnifiedCache.getInstance()

// Communication Cache
export const CommunicationCache = {
  get: (id: string, params?: Record<string, any>) => 
    cache.get(CacheKeyType.COMMUNICATION, id, params),
    
  set: (id: string, data: any, ttl = CACHE_TTL.MEDIUM, params?: Record<string, any>) =>
    cache.set(CacheKeyType.COMMUNICATION, id, data, ttl, params),
    
  delete: (id: string, params?: Record<string, any>) =>
    cache.delete(CacheKeyType.COMMUNICATION, id, params),
    
  clear: () => cache.clearType(CacheKeyType.COMMUNICATION)
}

// User Cache
export const UserCache = {
  get: (id: string, params?: Record<string, any>) =>
    cache.get(CacheKeyType.USER, id, params),
    
  set: (id: string, data: any, ttl = CACHE_TTL.LONG, params?: Record<string, any>) =>
    cache.set(CacheKeyType.USER, id, data, ttl, params),
    
  delete: (id: string, params?: Record<string, any>) =>
    cache.delete(CacheKeyType.USER, id, params),
    
  clear: () => cache.clearType(CacheKeyType.USER)
}

// Permission Cache
export const PermissionCache = {
  get: (userId: string, params?: Record<string, any>) =>
    cache.get(CacheKeyType.PERMISSION, userId, params),
    
  set: (userId: string, permissions: string[], ttl = CACHE_TTL.HOUR, params?: Record<string, any>) =>
    cache.set(CacheKeyType.PERMISSION, userId, permissions, ttl, params),
    
  delete: (userId: string, params?: Record<string, any>) =>
    cache.delete(CacheKeyType.PERMISSION, userId, params),
    
  clear: () => cache.clearType(CacheKeyType.PERMISSION)
}

// Stats Cache  
export const StatsCache = {
  get: (key: string, params?: Record<string, any>) =>
    cache.get(CacheKeyType.STATS, key, params),
    
  set: (key: string, data: any, ttl = CACHE_TTL.SHORT, params?: Record<string, any>) =>
    cache.set(CacheKeyType.STATS, key, data, ttl, params),
    
  delete: (key: string, params?: Record<string, any>) =>
    cache.delete(CacheKeyType.STATS, key, params),
    
  clear: () => cache.clearType(CacheKeyType.STATS)
}

// API Response Cache
export const ApiCache = {
  get: (endpoint: string, params?: Record<string, any>) =>
    cache.get(CacheKeyType.API, endpoint, params),
    
  set: (endpoint: string, response: any, ttl = CACHE_TTL.MEDIUM, params?: Record<string, any>) =>
    cache.set(CacheKeyType.API, endpoint, response, ttl, params),
    
  delete: (endpoint: string, params?: Record<string, any>) =>
    cache.delete(CacheKeyType.API, endpoint, params),
    
  clear: () => cache.clearType(CacheKeyType.API)
}

// 📊 Cache Utilities
export const CacheUtils = {
  // Get cache statistics
  getStats: () => cache.getStats(),
  
  // Clear all cache
  clearAll: () => cache.clearAll(),
  
  // Cache-aside pattern helper
  getOrSet: <T>(
    type: CacheKeyType,
    identifier: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    params?: Record<string, any>
  ) => cache.getOrSet(type, identifier, fetcher, ttl, params),
  
  // Generate cache key (for debugging)
  generateKey: (type: CacheKeyType, identifier: string, params?: Record<string, any>) => {
    return `${type}:${identifier}${params ? ':' + createHash('md5').update(JSON.stringify(params)).digest('hex').substring(0, 8) : ''}`
  }
}

// Default export
export default UnifiedCache