/**
 * Enhanced Health Check API Endpoint with Performance Metrics
 * KCISLK ESID Info Hub - Health Check API Endpoint
 * 
 * This endpoint is used by Docker health checks and monitoring systems
 * to verify that the application is running correctly.
 * Enhanced with database performance monitoring.
 */

import { NextResponse } from 'next/server'
import { performHealthCheck } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { performance } from 'perf_hooks'
import packageJson from '../../../package.json'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = performance.now()
  
  try {
    // Perform comprehensive health check
    const dbHealth = await performHealthCheck()
    const cacheStats = cache.getStats()
    const totalTime = performance.now() - startTime
    
    const healthStatus = {
      status: dbHealth.status === 'healthy' ? 'OK' : 'DEGRADED',
      service: 'KCISLK ESID Info Hub',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || packageJson.version,
      performance: {
        responseTime: `${totalTime.toFixed(2)}ms`,
        database: {
          status: dbHealth.status,
          connectionTime: dbHealth.connectionTime ? `${dbHealth.connectionTime.toFixed(2)}ms` : 'N/A',
          counts: dbHealth.counts || {}
        },
        cache: {
          hitRate: `${cacheStats.hitRate.toFixed(1)}%`,
          size: cacheStats.size,
          hits: cacheStats.hits,
          misses: cacheStats.misses
        },
        memory: {
          used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
          total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)}MB`
        }
      },
      checks: {
        database: dbHealth.status === 'healthy' ? '✅' : '❌',
        cache: cacheStats.hitRate > 0 ? '✅' : '⚠️',
        memory: process.memoryUsage().heapUsed < 512 * 1024 * 1024 ? '✅' : '⚠️'
      }
    }

    // Determine appropriate HTTP status
    const httpStatus = dbHealth.status === 'healthy' ? 200 : 503

    return NextResponse.json(healthStatus, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    // If there's any error, return unhealthy status
    const totalTime = performance.now() - startTime
    const errorStatus = {
      status: 'ERROR',
      service: 'KCISLK ESID Info Hub',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      performance: {
        responseTime: `${totalTime.toFixed(2)}ms`
      }
    }

    return NextResponse.json(errorStatus, { status: 500 })
  }
}

// Support HEAD requests for lightweight health checks
export async function HEAD() {
  const startTime = performance.now()
  
  try {
    // Quick database ping
    const dbHealth = await performHealthCheck()
    const totalTime = performance.now() - startTime
    
    const status = dbHealth.status === 'healthy' ? 200 : 503
    
    return new NextResponse(null, { 
      status,
      headers: {
        'X-Health-Status': dbHealth.status,
        'X-Response-Time': `${totalTime.toFixed(2)}ms`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}