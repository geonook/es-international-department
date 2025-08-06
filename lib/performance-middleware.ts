/**
 * API Performance Optimization Middleware
 * KCISLK ESID Info Hub - API 效能優化中間件
 * 
 * Provides performance monitoring, caching, and optimization features
 */

import { NextRequest, NextResponse } from 'next/server'
import { performance } from 'perf_hooks'
import { cache } from '@/lib/cache'

interface PerformanceMetrics {
  endpoint: string
  method: string
  responseTime: number
  timestamp: string
  statusCode: number
  cached: boolean
  userAgent?: string
}

const performanceLog: PerformanceMetrics[] = []
const MAX_LOG_SIZE = 1000

/**
 * Performance monitoring middleware
 */
export function withPerformanceMonitoring(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = performance.now()
    const endpoint = new URL(request.url).pathname
    const method = request.method

    try {
      // Execute the handler
      const response = await handler(request)
      const endTime = performance.now()
      const responseTime = endTime - startTime

      // Log performance metrics
      const metrics: PerformanceMetrics = {
        endpoint,
        method,
        responseTime,
        timestamp: new Date().toISOString(),
        statusCode: response.status,
        cached: false, // Will be set by cache headers if applicable
        userAgent: request.headers.get('user-agent') || undefined
      }

      // Add to performance log (with rotation)
      performanceLog.push(metrics)
      if (performanceLog.length > MAX_LOG_SIZE) {
        performanceLog.shift()
      }

      // Add performance headers
      const enhancedResponse = new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'X-Response-Time': `${responseTime.toFixed(2)}ms`,
          'X-Performance-Timestamp': new Date().toISOString()
        }
      })

      // Log slow requests
      if (responseTime > 500) {
        console.warn(
          `⚡ Slow API Response: ${method} ${endpoint} took ${responseTime.toFixed(2)}ms`
        )
      }

      return enhancedResponse

    } catch (error) {
      const endTime = performance.now()
      const responseTime = endTime - startTime

      console.error(
        `❌ API Error: ${method} ${endpoint} failed after ${responseTime.toFixed(2)}ms:`,
        error
      )

      // Log error metrics
      performanceLog.push({
        endpoint,
        method,
        responseTime,
        timestamp: new Date().toISOString(),
        statusCode: 500,
        cached: false
      })

      // Return error response with performance headers
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Internal server error',
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'X-Response-Time': `${responseTime.toFixed(2)}ms`,
            'X-Error': 'true'
          }
        }
      )
    }
  }
}

/**
 * Response caching middleware with compression
 */
export function withResponseCaching(
  handler: (request: NextRequest) => Promise<NextResponse>,
  cacheConfig: {
    ttl?: number
    keyGenerator?: (request: NextRequest) => string
    shouldCache?: (request: NextRequest, response: NextResponse) => boolean
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Generate cache key
    const cacheKey = cacheConfig.keyGenerator 
      ? cacheConfig.keyGenerator(request)
      : `response:${request.method}:${new URL(request.url).pathname}:${new URL(request.url).searchParams.toString()}`

    // Check cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = cache.get(cacheKey)
      if (cachedResponse) {
        return new NextResponse(JSON.stringify(cachedResponse.body), {
          status: cachedResponse.status,
          headers: {
            ...cachedResponse.headers,
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey.substring(0, 50) + '...'
          }
        })
      }
    }

    // Execute handler
    const response = await handler(request)

    // Cache successful GET responses
    if (
      request.method === 'GET' && 
      response.status < 400 &&
      (!cacheConfig.shouldCache || cacheConfig.shouldCache(request, response))
    ) {
      try {
        const responseBody = await response.clone().json()
        cache.set(
          cacheKey,
          {
            body: responseBody,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
          },
          cacheConfig.ttl
        )
      } catch (error) {
        console.warn('Failed to cache response:', error)
      }
    }

    // Add cache headers
    const enhancedResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'X-Cache': 'MISS',
        'X-Cache-Key': cacheKey.substring(0, 50) + '...'
      }
    })

    return enhancedResponse
  }
}

/**
 * Rate limiting middleware
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    maxRequests?: number
    windowMs?: number
    keyGenerator?: (request: NextRequest) => string
  } = {}
) {
  const maxRequests = options.maxRequests || 100
  const windowMs = options.windowMs || 60000 // 1 minute
  const keyGenerator = options.keyGenerator || ((req: NextRequest) => 
    req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous'
  )

  return async (request: NextRequest): Promise<NextResponse> => {
    const key = `ratelimit:${keyGenerator(request)}`
    const now = Date.now()
    
    const current = requestCounts.get(key)
    if (!current || now > current.resetTime) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs })
    } else {
      current.count++
      if (current.count > maxRequests) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Rate limit exceeded',
            message: 'Too many requests, please try again later'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(current.resetTime / 1000).toString()
            }
          }
        )
      }
    }

    const response = await handler(request)
    const remaining = Math.max(0, maxRequests - (requestCounts.get(key)?.count || 0))
    
    // Add rate limit headers
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.ceil((requestCounts.get(key)?.resetTime || now) / 1000).toString()
      }
    })
  }
}

/**
 * Composite performance middleware
 */
export function withOptimizations(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    enableCaching?: boolean
    enableRateLimit?: boolean
    cacheConfig?: Parameters<typeof withResponseCaching>[1]
    rateLimitConfig?: Parameters<typeof withRateLimit>[1]
  } = {}
) {
  let optimizedHandler = handler

  // Apply rate limiting
  if (options.enableRateLimit !== false) {
    optimizedHandler = withRateLimit(optimizedHandler, options.rateLimitConfig)
  }

  // Apply caching
  if (options.enableCaching !== false) {
    optimizedHandler = withResponseCaching(optimizedHandler, options.cacheConfig)
  }

  // Apply performance monitoring
  optimizedHandler = withPerformanceMonitoring(optimizedHandler)

  return optimizedHandler
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  const now = Date.now()
  const last5Minutes = performanceLog.filter(
    metric => new Date(metric.timestamp).getTime() > now - 5 * 60 * 1000
  )

  if (last5Minutes.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      errorRate: 0,
      endpoints: {}
    }
  }

  const totalRequests = last5Minutes.length
  const averageResponseTime = last5Minutes.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests
  const slowRequests = last5Minutes.filter(m => m.responseTime > 500).length
  const errorRequests = last5Minutes.filter(m => m.statusCode >= 400).length
  const errorRate = (errorRequests / totalRequests) * 100

  // Group by endpoint
  const endpoints: Record<string, any> = {}
  last5Minutes.forEach(metric => {
    const key = `${metric.method} ${metric.endpoint}`
    if (!endpoints[key]) {
      endpoints[key] = {
        count: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        errors: 0
      }
    }
    endpoints[key].count++
    endpoints[key].avgResponseTime = 
      (endpoints[key].avgResponseTime * (endpoints[key].count - 1) + metric.responseTime) / endpoints[key].count
    endpoints[key].maxResponseTime = Math.max(endpoints[key].maxResponseTime, metric.responseTime)
    if (metric.statusCode >= 400) {
      endpoints[key].errors++
    }
  })

  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime * 100) / 100,
    slowRequests,
    errorRate: Math.round(errorRate * 100) / 100,
    endpoints
  }
}

// Cleanup old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(key)
    }
  }
}, 5 * 60 * 1000)