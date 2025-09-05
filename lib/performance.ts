/**
 * Performance Monitoring and Query Optimization Utilities
 * KCISLK ESID Info Hub - Performance Enhancement Module
 */

import { performance } from 'perf_hooks'

interface QueryMetrics {
  queryName: string
  executionTime: number
  timestamp: Date
  success: boolean
  error?: string
}

interface PerformanceMetrics {
  totalQueries: number
  averageQueryTime: number
  slowQueries: QueryMetrics[]
  errorCount: number
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: QueryMetrics[] = []
  private slowQueryThreshold = 100 // 100ms threshold for slow queries

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Monitor database query performance
   */
  public async monitorQuery<T>(
    queryName: string,
    queryFunction: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    let success = true
    let error: string | undefined

    try {
      const result = await queryFunction()
      return result
    } catch (err) {
      success = false
      error = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      const endTime = performance.now()
      const executionTime = endTime - startTime

      const metric: QueryMetrics = {
        queryName,
        executionTime,
        timestamp: new Date(),
        success,
        error
      }

      this.metrics.push(metric)

      // Log slow queries
      if (executionTime > this.slowQueryThreshold) {
        console.warn(`🐌 Slow Query Detected: ${queryName}`, {
          executionTime: `${executionTime.toFixed(2)}ms`,
          success,
          error
        })
      }

      // Keep only last 1000 metrics to prevent memory issues
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000)
      }
    }
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    const totalQueries = this.metrics.length
    const successfulQueries = this.metrics.filter(m => m.success)
    const averageQueryTime = successfulQueries.length > 0
      ? successfulQueries.reduce((sum, m) => sum + m.executionTime, 0) / successfulQueries.length
      : 0

    const slowQueries = this.metrics.filter(m => m.executionTime > this.slowQueryThreshold)
    const errorCount = this.metrics.filter(m => !m.success).length

    return {
      totalQueries,
      averageQueryTime,
      slowQueries,
      errorCount
    }
  }

  /**
   * Get slow queries report
   */
  public getSlowQueriesReport(): string {
    const slowQueries = this.metrics
      .filter(m => m.executionTime > this.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10) // Top 10 slowest queries

    if (slowQueries.length === 0) {
      return '✅ No slow queries detected!'
    }

    let report = '🐌 Top 10 Slowest Queries:\n\n'
    slowQueries.forEach((query, index) => {
      report += `${index + 1}. ${query.queryName}\n`
      report += `   ⏱️  ${query.executionTime.toFixed(2)}ms\n`
      report += `   📅 ${query.timestamp.toISOString()}\n`
      report += `   ${query.success ? '✅' : '❌'} ${query.error || 'Success'}\n\n`
    })

    return report
  }

  /**
   * Clear metrics
   */
  public clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Set slow query threshold
   */
  public setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

/**
 * Decorator for monitoring Prisma queries
 */
export function withPerformanceMonitoring<T>(
  queryName: string,
  queryFunction: () => Promise<T>
): Promise<T> {
  return performanceMonitor.monitorQuery(queryName, queryFunction)
}

/**
 * Performance metrics endpoint data
 */
export interface PerformanceReport {
  timestamp: string
  uptime: string
  metrics: PerformanceMetrics
  recommendations: string[]
  systemHealth: {
    memoryUsage: NodeJS.MemoryUsage
    cpuUsage: NodeJS.CpuUsage | null
  }
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(): PerformanceReport {
  const metrics = performanceMonitor.getMetrics()
  const recommendations: string[] = []

  // Add recommendations based on metrics
  if (metrics.averageQueryTime > 200) {
    recommendations.push('Average query time is high (>200ms). Consider adding database indexes.')
  }

  if (metrics.slowQueries.length > 10) {
    recommendations.push('Multiple slow queries detected. Review database schema and query optimization.')
  }

  if (metrics.errorCount > 0) {
    recommendations.push(`${metrics.errorCount} query errors detected. Check application logs.`)
  }

  if (metrics.totalQueries === 0) {
    recommendations.push('No queries monitored yet. Performance monitoring is active.')
  }

  // Get system health
  const memoryUsage = process.memoryUsage()
  let cpuUsage: NodeJS.CpuUsage | null = null
  
  try {
    cpuUsage = process.cpuUsage()
  } catch (error) {
    console.warn('Could not get CPU usage:', error)
  }

  return {
    timestamp: new Date().toISOString(),
    uptime: formatUptime(process.uptime()),
    metrics,
    recommendations,
    systemHealth: {
      memoryUsage,
      cpuUsage
    }
  }
}

/**
 * Format uptime in human readable format
 */
function formatUptime(uptime: number): string {
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const seconds = Math.floor(uptime % 60)
  
  return `${hours}h ${minutes}m ${seconds}s`
}

/**
 * Query optimization patterns for common scenarios
 */
export const QueryOptimizations = {
  // User with roles query optimization
  userWithRoles: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      displayName: true,
      isActive: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
              displayName: true
            }
          }
        }
      }
    }
  },

  // Event list optimization
  eventList: {
    select: {
      id: true,
      title: true,
      description: true,
      eventType: true,
      startDate: true,
      endDate: true,
      location: true,
      status: true,
      isFeatured: true,
      creator: {
        select: {
          id: true,
          displayName: true
        }
      }
    }
  },

  // Reminder list optimization
  reminderList: {
    select: {
      id: true,
      title: true,
      content: true,
      priority: true,
      status: true,
      dueDate: true,
      createdAt: true,
      creator: {
        select: {
          id: true,
          displayName: true
        }
      }
    }
  }
}