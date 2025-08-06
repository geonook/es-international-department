/**
 * Performance Analysis and Optimization Tool
 * KCISLK ESID Info Hub - API Performance Benchmarking
 * 
 * This script analyzes API performance bottlenecks and provides optimization recommendations
 */

import { performance } from 'perf_hooks'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch' // You may need to install this
import fs from 'fs/promises'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

interface PerformanceResult {
  endpoint: string
  method: string
  avgResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  successRate: number
  errors: string[]
  databaseQueries: number
  slowQueries: any[]
}

interface DatabasePerformanceResult {
  query: string
  duration: number
  timestamp: string
  params?: any
}

class PerformanceAnalyzer {
  private results: PerformanceResult[] = []
  private dbQueries: DatabasePerformanceResult[] = []
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    this.setupDatabaseMonitoring()
  }

  private setupDatabaseMonitoring() {
    // Monitor Prisma queries
    prisma.$use(async (params, next) => {
      const before = performance.now()
      const result = await next(params)
      const after = performance.now()
      const duration = after - before

      this.dbQueries.push({
        query: `${params.model}.${params.action}`,
        duration,
        timestamp: new Date().toISOString(),
        params: params.args
      })

      // Log slow queries (>50ms)
      if (duration > 50) {
        console.warn(`🐌 Slow Query Alert: ${params.model}.${params.action} took ${duration.toFixed(2)}ms`)
      }

      return result
    })
  }

  async benchmarkEndpoint(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    iterations: number = 10,
    headers?: Record<string, string>,
    body?: any
  ): Promise<PerformanceResult> {
    const times: number[] = []
    const errors: string[] = []
    let successCount = 0

    console.log(`🧪 Benchmarking ${method} ${endpoint} (${iterations} iterations)...`)

    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          ...(body && { body: JSON.stringify(body) })
        })

        if (response.ok) {
          successCount++
        } else {
          errors.push(`${response.status}: ${response.statusText}`)
        }

        const end = performance.now()
        times.push(end - start)
        
      } catch (error) {
        const end = performance.now()
        times.push(end - start)
        errors.push(error instanceof Error ? error.message : 'Unknown error')
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    const sortedTimes = times.sort((a, b) => a - b)
    const avgResponseTime = times.reduce((sum, time) => sum + time, 0) / times.length
    const p95Index = Math.floor(times.length * 0.95)
    const p99Index = Math.floor(times.length * 0.99)

    const result: PerformanceResult = {
      endpoint,
      method,
      avgResponseTime,
      p95ResponseTime: sortedTimes[p95Index] || avgResponseTime,
      p99ResponseTime: sortedTimes[p99Index] || avgResponseTime,
      successRate: (successCount / iterations) * 100,
      errors,
      databaseQueries: this.dbQueries.length,
      slowQueries: this.dbQueries.filter(q => q.duration > 50)
    }

    this.results.push(result)
    return result
  }

  async analyzeDatabase(): Promise<void> {
    console.log('🗄️ Analyzing database performance...')

    // Test basic queries
    const queries = [
      () => prisma.user.count(),
      () => prisma.announcement.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
      () => prisma.event.findMany({ take: 10, include: { creator: true } }),
      () => prisma.resource.findMany({ 
        take: 10, 
        include: { 
          gradeLevel: true, 
          category: true, 
          creator: { select: { displayName: true } },
          tags: { include: { tag: true } }
        }
      }),
      () => prisma.notification.findMany({ take: 10, include: { recipient: true } })
    ]

    for (const query of queries) {
      const start = performance.now()
      try {
        await query()
      } catch (error) {
        console.error('Database query error:', error)
      }
      const end = performance.now()
      console.log(`Query took ${(end - start).toFixed(2)}ms`)
    }
  }

  async runFullAnalysis(): Promise<void> {
    console.log('🚀 Starting comprehensive performance analysis...')
    
    // Test key API endpoints
    const endpointsToTest = [
      { path: '/api/health', method: 'GET' as const },
      { path: '/api/announcements', method: 'GET' as const },
      { path: '/api/admin/announcements', method: 'GET' as const },
      { path: '/api/admin/resources', method: 'GET' as const },
      { path: '/api/admin/events', method: 'GET' as const },
      { path: '/api/admin/users', method: 'GET' as const }
    ]

    // Database analysis
    await this.analyzeDatabase()

    // API endpoint analysis
    for (const endpoint of endpointsToTest) {
      await this.benchmarkEndpoint(
        endpoint.path,
        endpoint.method,
        5 // Reduced iterations for faster testing
      )
    }

    // Generate report
    await this.generateReport()
  }

  private async generateReport(): Promise<void> {
    const timestamp = new Date().toISOString()
    
    const report = {
      timestamp,
      summary: {
        totalEndpoints: this.results.length,
        avgResponseTime: this.results.reduce((sum, r) => sum + r.avgResponseTime, 0) / this.results.length,
        slowEndpoints: this.results.filter(r => r.avgResponseTime > 200),
        errorEndpoints: this.results.filter(r => r.successRate < 100),
        totalDatabaseQueries: this.dbQueries.length,
        slowQueries: this.dbQueries.filter(q => q.duration > 50)
      },
      endpoints: this.results,
      databaseQueries: this.dbQueries,
      recommendations: this.generateRecommendations()
    }

    // Save report to file
    const reportPath = `./output/performance-report-${Date.now()}.json`
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))

    // Display summary
    this.displaySummary(report)
    
    console.log(`\n📊 Full report saved to: ${reportPath}`)
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    // Response time recommendations
    const slowEndpoints = this.results.filter(r => r.avgResponseTime > 200)
    if (slowEndpoints.length > 0) {
      recommendations.push(`⚠️ ${slowEndpoints.length} endpoints exceed 200ms target. Consider optimizing database queries and adding caching.`)
    }

    // Database recommendations
    const slowQueries = this.dbQueries.filter(q => q.duration > 50)
    if (slowQueries.length > 0) {
      recommendations.push(`🗄️ ${slowQueries.length} slow database queries detected. Add indexes and optimize Prisma includes.`)
    }

    // Success rate recommendations
    const errorEndpoints = this.results.filter(r => r.successRate < 100)
    if (errorEndpoints.length > 0) {
      recommendations.push(`❌ ${errorEndpoints.length} endpoints have errors. Review error handling and validation.`)
    }

    // Query count recommendations
    const queryHeavyEndpoints = this.results.filter(r => r.databaseQueries > 5)
    if (queryHeavyEndpoints.length > 0) {
      recommendations.push(`📈 Endpoints with >5 DB queries detected. Consider query batching and optimization.`)
    }

    return recommendations
  }

  private displaySummary(report: any): void {
    console.log('\n' + '='.repeat(60))
    console.log('🎯 PERFORMANCE ANALYSIS SUMMARY')
    console.log('='.repeat(60))
    
    console.log(`\n📊 Overall Metrics:`)    
    console.log(`   • Average Response Time: ${report.summary.avgResponseTime.toFixed(2)}ms`)
    console.log(`   • Endpoints Tested: ${report.summary.totalEndpoints}`)
    console.log(`   • Database Queries: ${report.summary.totalDatabaseQueries}`)
    console.log(`   • Slow Queries (>50ms): ${report.summary.slowQueries.length}`)

    console.log(`\n🚨 Issues Found:`)    
    console.log(`   • Slow Endpoints (>200ms): ${report.summary.slowEndpoints.length}`)
    console.log(`   • Error Endpoints: ${report.summary.errorEndpoints.length}`)

    if (report.summary.slowEndpoints.length > 0) {
      console.log(`\n🐌 Slowest Endpoints:`)
      report.summary.slowEndpoints
        .sort((a: any, b: any) => b.avgResponseTime - a.avgResponseTime)
        .slice(0, 5)
        .forEach((endpoint: any) => {
          console.log(`   • ${endpoint.method} ${endpoint.endpoint}: ${endpoint.avgResponseTime.toFixed(2)}ms`)
        })
    }

    if (report.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`)
      report.recommendations.forEach((rec: string) => {
        console.log(`   ${rec}`)
      })
    }

    console.log('\n' + '='.repeat(60))
  }

  async cleanup(): Promise<void> {
    await prisma.$disconnect()
  }
}

// Main execution
async function main() {
  const analyzer = new PerformanceAnalyzer()
  
  try {
    await analyzer.runFullAnalysis()
  } catch (error) {
    console.error('Performance analysis failed:', error)
  } finally {
    await analyzer.cleanup()
  }
}

if (require.main === module) {
  main()
}

export { PerformanceAnalyzer }