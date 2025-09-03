#!/usr/bin/env tsx

/**
 * Performance Benchmark Testing System
 * KCISLK ESID Info Hub - Automated Performance Testing
 * 
 * This script establishes performance baselines and continuously monitors
 * system performance against defined thresholds with automated alerting.
 */

import { PrismaClient } from '@prisma/client'
import { performance } from 'perf_hooks'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

interface BenchmarkMetric {
  name: string
  category: 'database' | 'api' | 'system'
  target: number
  warning: number
  critical: number
  unit: 'ms' | 'ops/sec' | 'MB' | 'count'
  description: string
}

interface BenchmarkResult {
  metric: string
  value: number
  status: 'pass' | 'warning' | 'critical'
  timestamp: string
  duration: number
  baseline?: number
  trend?: 'improving' | 'degrading' | 'stable'
}

interface BenchmarkReport {
  timestamp: string
  summary: {
    totalTests: number
    passed: number
    warnings: number
    critical: number
    overallScore: number
  }
  results: BenchmarkResult[]
  recommendations: string[]
  trends: {
    improving: string[]
    degrading: string[]
    stable: string[]
  }
}

class PerformanceBenchmark {
  private prisma: PrismaClient
  private baseUrl: string
  private results: BenchmarkResult[] = []
  private baselines = new Map<string, number>()
  
  // Define performance thresholds
  private metrics: BenchmarkMetric[] = [
    // Database Metrics
    {
      name: 'db_connection_time',
      category: 'database',
      target: 50,
      warning: 100,
      critical: 200,
      unit: 'ms',
      description: 'Database connection establishment time'
    },
    {
      name: 'db_simple_query_time',
      category: 'database',
      target: 10,
      warning: 25,
      critical: 50,
      unit: 'ms',
      description: 'Simple SELECT query response time'
    },
    {
      name: 'db_complex_query_time',
      category: 'database',
      target: 100,
      warning: 250,
      critical: 500,
      unit: 'ms',
      description: 'Complex JOIN query with relations response time'
    },
    {
      name: 'db_write_operation_time',
      category: 'database',
      target: 20,
      warning: 50,
      critical: 100,
      unit: 'ms',
      description: 'Database write operation response time'
    },
    {
      name: 'db_concurrent_connections',
      category: 'database',
      target: 10,
      warning: 25,
      critical: 50,
      unit: 'count',
      description: 'Number of concurrent database connections'
    },
    
    // API Metrics
    {
      name: 'api_health_check_time',
      category: 'api',
      target: 50,
      warning: 100,
      critical: 200,
      unit: 'ms',
      description: 'Health check endpoint response time'
    },
    {
      name: 'api_resource_list_time',
      category: 'api',
      target: 200,
      warning: 500,
      critical: 1000,
      unit: 'ms',
      description: 'Resource listing API response time'
    },
    {
      name: 'api_event_list_time',
      category: 'api',
      target: 150,
      warning: 300,
      critical: 600,
      unit: 'ms',
      description: 'Event listing API response time'
    },
    {
      name: 'api_user_management_time',
      category: 'api',
      target: 100,
      warning: 250,
      critical: 500,
      unit: 'ms',
      description: 'User management API response time'
    },
    {
      name: 'api_throughput',
      category: 'api',
      target: 100,
      warning: 50,
      critical: 20,
      unit: 'ops/sec',
      description: 'API requests handled per second'
    },
    
    // System Metrics
    {
      name: 'memory_usage',
      category: 'system',
      target: 512,
      warning: 1024,
      critical: 2048,
      unit: 'MB',
      description: 'Application memory usage'
    },
    {
      name: 'query_efficiency_score',
      category: 'database',
      target: 90,
      warning: 70,
      critical: 50,
      unit: 'count',
      description: 'Query efficiency score (higher is better)'
    }
  ]
  
  constructor() {
    this.prisma = new PrismaClient()
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    this.loadBaselines()
  }
  
  private loadBaselines(): void {
    try {
      const baselinePath = path.join(process.cwd(), 'output', 'performance-baselines.json')
      if (fs.existsSync(baselinePath)) {
        const baselines = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
        Object.entries(baselines).forEach(([key, value]) => {
          this.baselines.set(key, value as number)
        })
        console.log(`📊 Loaded ${this.baselines.size} performance baselines`)
      }
    } catch (error) {
      console.log('ℹ️ No existing baselines found, will establish new baselines')
    }
  }
  
  async runFullBenchmark(): Promise<void> {
    console.log('🏁 Starting comprehensive performance benchmark...')
    console.log(`📊 Testing ${this.metrics.length} performance metrics\n`)
    
    this.results = []
    const startTime = performance.now()
    
    // Database benchmarks
    await this.benchmarkDatabase()
    
    // API benchmarks
    await this.benchmarkAPIs()
    
    // System benchmarks
    await this.benchmarkSystem()
    
    const endTime = performance.now()
    console.log(`\n⏱️ Benchmark completed in ${(endTime - startTime).toFixed(2)}ms`)
    
    // Generate comprehensive report
    await this.generateBenchmarkReport()
    
    // Save baselines if this is the first run
    await this.updateBaselines()
  }
  
  private async benchmarkDatabase(): Promise<void> {
    console.log('🗄️ Benchmarking database performance...')
    
    // 1. Connection time
    await this.runBenchmark('db_connection_time', async () => {
      const start = performance.now()
      await this.prisma.$queryRaw`SELECT 1 as test`
      return performance.now() - start
    })
    
    // 2. Simple query time
    await this.runBenchmark('db_simple_query_time', async () => {
      const start = performance.now()
      await this.prisma.user.count()
      return performance.now() - start
    })
    
    // 3. Complex query time
    await this.runBenchmark('db_complex_query_time', async () => {
      const start = performance.now()
      await this.prisma.resource.findMany({
        take: 10,
        include: {
          creator: {
            select: {
              id: true,
              displayName: true
            }
          },
          category: true,
          gradeLevel: true,
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return performance.now() - start
    })
    
    // 4. Write operation time
    await this.runBenchmark('db_write_operation_time', async () => {
      const start = performance.now()
      
      // Create and immediately delete a test record
      const testUser = await this.prisma.user.create({
        data: {
          email: `test-${Date.now()}@benchmark.test`,
          displayName: 'Benchmark Test User',
          passwordHash: 'test-hash-for-benchmark'
        }
      })
      
      await this.prisma.user.delete({
        where: { id: testUser.id }
      })
      
      return performance.now() - start
    })
    
    // 5. Connection count
    await this.runBenchmark('db_concurrent_connections', async () => {
      const result = await this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT count(*) as count 
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `
      return Array.isArray(result) ? Number(result[0].count) : 1
    })
    
    // 6. Query efficiency score
    await this.runBenchmark('query_efficiency_score', async () => {
      // Run a series of queries and measure efficiency
      const queries = [
        () => this.prisma.user.findMany({ take: 5 }),
        () => this.prisma.resource.findMany({ 
          take: 5,
          include: { creator: true, category: true }
        }),
        () => this.prisma.event.findMany({ 
          take: 5,
          include: { creator: true }
        })
      ]
      
      let totalQueries = 0
      let efficientQueries = 0
      
      for (const query of queries) {
        const start = performance.now()
        await query()
        const duration = performance.now() - start
        
        totalQueries++
        if (duration < 50) { // Queries under 50ms are considered efficient
          efficientQueries++
        }
      }
      
      return totalQueries > 0 ? (efficientQueries / totalQueries) * 100 : 0
    })
    
    console.log('   ✅ Database benchmarks completed')
  }
  
  private async benchmarkAPIs(): Promise<void> {
    console.log('🌐 Benchmarking API performance...')
    
    // 1. Health check endpoint
    await this.runBenchmark('api_health_check_time', async () => {
      const start = performance.now()
      try {
        const response = await fetch(`${this.baseUrl}/api/health`, {
          method: 'GET',
          timeout: 5000
        })
        await response.text()
        return performance.now() - start
      } catch (error) {
        return 5000 // Timeout or error
      }
    })
    
    // 2. Resource list API
    await this.runBenchmark('api_resource_list_time', async () => {
      const start = performance.now()
      try {
        const response = await fetch(`${this.baseUrl}/api/admin/resources`, {
          method: 'GET',
          timeout: 10000,
          headers: {
            'Authorization': 'Bearer test-token-for-benchmark'
          }
        })
        await response.text()
        return performance.now() - start
      } catch (error) {
        return 10000 // Timeout or error
      }
    })
    
    // 3. Event list API
    await this.runBenchmark('api_event_list_time', async () => {
      const start = performance.now()
      try {
        const response = await fetch(`${this.baseUrl}/api/admin/events`, {
          method: 'GET',
          timeout: 8000,
          headers: {
            'Authorization': 'Bearer test-token-for-benchmark'
          }
        })
        await response.text()
        return performance.now() - start
      } catch (error) {
        return 8000 // Timeout or error
      }
    })
    
    // 4. User management API
    await this.runBenchmark('api_user_management_time', async () => {
      const start = performance.now()
      try {
        const response = await fetch(`${this.baseUrl}/api/admin/users`, {
          method: 'GET',
          timeout: 6000,
          headers: {
            'Authorization': 'Bearer test-token-for-benchmark'
          }
        })
        await response.text()
        return performance.now() - start
      } catch (error) {
        return 6000 // Timeout or error
      }
    })
    
    // 5. API throughput test
    await this.runBenchmark('api_throughput', async () => {
      const testDuration = 5000 // 5 seconds
      const startTime = performance.now()
      let requestCount = 0
      
      const makeRequest = async () => {
        try {
          await fetch(`${this.baseUrl}/api/health`, { timeout: 1000 })
          requestCount++
        } catch (error) {
          // Ignore errors for throughput test
        }
      }
      
      const promises: Promise<void>[] = []
      while (performance.now() - startTime < testDuration) {
        promises.push(makeRequest())
        if (promises.length >= 10) {
          await Promise.allSettled(promises)
          promises.length = 0
        }
      }
      
      // Wait for remaining requests
      await Promise.allSettled(promises)
      
      const actualDuration = performance.now() - startTime
      return (requestCount / actualDuration) * 1000 // ops per second
    })
    
    console.log('   ✅ API benchmarks completed')
  }
  
  private async benchmarkSystem(): Promise<void> {
    console.log('💻 Benchmarking system performance...')
    
    // Memory usage
    await this.runBenchmark('memory_usage', async () => {
      const used = process.memoryUsage()
      return Math.round(used.heapUsed / 1024 / 1024) // MB
    })
    
    console.log('   ✅ System benchmarks completed')
  }
  
  private async runBenchmark(
    metricName: string, 
    benchmarkFn: () => Promise<number>
  ): Promise<void> {
    const metric = this.metrics.find(m => m.name === metricName)
    if (!metric) {
      console.warn(`⚠️ Unknown metric: ${metricName}`)
      return
    }
    
    console.log(`   🧪 Testing ${metric.description}...`)
    
    try {
      const startTime = performance.now()
      const value = await benchmarkFn()
      const duration = performance.now() - startTime
      
      // Determine status based on thresholds
      let status: 'pass' | 'warning' | 'critical'
      if (metric.unit === 'ops/sec') {
        // Higher is better for ops/sec
        status = value >= metric.target ? 'pass' : 
                 value >= metric.warning ? 'warning' : 'critical'
      } else if (metric.name === 'query_efficiency_score') {
        // Higher is better for efficiency score
        status = value >= metric.target ? 'pass' : 
                 value >= metric.warning ? 'warning' : 'critical'
      } else {
        // Lower is better for time/memory metrics
        status = value <= metric.target ? 'pass' : 
                 value <= metric.warning ? 'warning' : 'critical'
      }
      
      // Calculate trend if baseline exists
      const baseline = this.baselines.get(metricName)
      let trend: 'improving' | 'degrading' | 'stable' | undefined
      
      if (baseline !== undefined) {
        const changePercent = ((value - baseline) / baseline) * 100
        if (Math.abs(changePercent) < 5) {
          trend = 'stable'
        } else if (metric.unit === 'ops/sec' || metric.name === 'query_efficiency_score') {
          trend = changePercent > 0 ? 'improving' : 'degrading'
        } else {
          trend = changePercent < 0 ? 'improving' : 'degrading'
        }
      }
      
      const result: BenchmarkResult = {
        metric: metricName,
        value: Math.round(value * 100) / 100,
        status,
        timestamp: new Date().toISOString(),
        duration: Math.round(duration * 100) / 100,
        baseline,
        trend
      }
      
      this.results.push(result)
      
      // Log result
      const statusEmoji = status === 'pass' ? '✅' : status === 'warning' ? '⚠️' : '❌'
      const trendEmoji = trend === 'improving' ? '📈' : trend === 'degrading' ? '📉' : '📊'
      console.log(`      ${statusEmoji} ${value.toFixed(2)}${metric.unit} ${trendEmoji}`)
      
    } catch (error) {
      console.error(`   ❌ Benchmark failed for ${metricName}:`, error)
      
      this.results.push({
        metric: metricName,
        value: -1,
        status: 'critical',
        timestamp: new Date().toISOString(),
        duration: 0
      })
    }
  }
  
  private async generateBenchmarkReport(): Promise<void> {
    const passedTests = this.results.filter(r => r.status === 'pass').length
    const warningTests = this.results.filter(r => r.status === 'warning').length
    const criticalTests = this.results.filter(r => r.status === 'critical').length
    
    const overallScore = Math.round((passedTests / this.results.length) * 100)
    
    // Group trends
    const trends = {
      improving: this.results.filter(r => r.trend === 'improving').map(r => r.metric),
      degrading: this.results.filter(r => r.trend === 'degrading').map(r => r.metric),
      stable: this.results.filter(r => r.trend === 'stable').map(r => r.metric)
    }
    
    const report: BenchmarkReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        passed: passedTests,
        warnings: warningTests,
        critical: criticalTests,
        overallScore
      },
      results: this.results,
      recommendations: this.generateRecommendations(),
      trends
    }
    
    // Display summary
    this.displayBenchmarkSummary(report)
    
    // Save detailed report
    const outputPath = path.join(process.cwd(), 'output', `performance-benchmark-${Date.now()}.json`)
    const outputDir = path.dirname(outputPath)
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Detailed benchmark report saved to: ${outputPath}`)
  }
  
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    // Database recommendations
    const dbIssues = this.results.filter(r => 
      r.metric.startsWith('db_') && r.status !== 'pass'
    )
    
    if (dbIssues.some(r => r.metric === 'db_connection_time')) {
      recommendations.push('🗄️ Database connection is slow. Check network latency and database server resources.')
    }
    
    if (dbIssues.some(r => r.metric === 'db_complex_query_time')) {
      recommendations.push('📊 Complex queries are slow. Add database indexes and optimize includes.')
    }
    
    if (dbIssues.some(r => r.metric === 'query_efficiency_score')) {
      recommendations.push('⚡ Query efficiency is low. Review N+1 queries and implement proper eager loading.')
    }
    
    // API recommendations
    const apiIssues = this.results.filter(r => 
      r.metric.startsWith('api_') && r.status !== 'pass'
    )
    
    if (apiIssues.length > 0) {
      recommendations.push('🌐 API response times are slow. Implement caching and optimize database queries.')
    }
    
    if (this.results.some(r => r.metric === 'api_throughput' && r.status !== 'pass')) {
      recommendations.push('📈 API throughput is low. Consider implementing connection pooling and load balancing.')
    }
    
    // System recommendations
    if (this.results.some(r => r.metric === 'memory_usage' && r.status !== 'pass')) {
      recommendations.push('💾 Memory usage is high. Check for memory leaks and optimize data structures.')
    }
    
    // Trend-based recommendations
    const degradingMetrics = this.results.filter(r => r.trend === 'degrading')
    if (degradingMetrics.length > 0) {
      recommendations.push(`📉 Performance degradation detected in: ${degradingMetrics.map(r => r.metric).join(', ')}`)
    }
    
    return recommendations
  }
  
  private displayBenchmarkSummary(report: BenchmarkReport): void {
    console.log('\n' + '='.repeat(80))
    console.log('🎯 PERFORMANCE BENCHMARK REPORT')
    console.log('='.repeat(80))
    
    console.log(`\n📊 Summary:`)
    console.log(`   • Overall Score: ${report.summary.overallScore}/100`)
    console.log(`   • Tests Passed: ${report.summary.passed}/${report.summary.totalTests}`)
    console.log(`   • Warnings: ${report.summary.warnings}`)
    console.log(`   • Critical Issues: ${report.summary.critical}`)
    
    // Performance status
    if (report.summary.overallScore >= 90) {
      console.log(`   ✅ Performance: Excellent`)
    } else if (report.summary.overallScore >= 75) {
      console.log(`   👍 Performance: Good`)
    } else if (report.summary.overallScore >= 60) {
      console.log(`   ⚠️ Performance: Needs Attention`)
    } else {
      console.log(`   ❌ Performance: Critical Issues`)
    }
    
    // Trends
    if (report.trends.improving.length > 0) {
      console.log(`\n📈 Improving Metrics: ${report.trends.improving.join(', ')}`)
    }
    
    if (report.trends.degrading.length > 0) {
      console.log(`\n📉 Degrading Metrics: ${report.trends.degrading.join(', ')}`)
    }
    
    // Critical issues
    const criticalIssues = report.results.filter(r => r.status === 'critical')
    if (criticalIssues.length > 0) {
      console.log(`\n🚨 Critical Issues:`)
      criticalIssues.forEach(issue => {
        const metric = this.metrics.find(m => m.name === issue.metric)
        console.log(`   • ${metric?.description}: ${issue.value}${metric?.unit} (threshold: ${metric?.critical}${metric?.unit})`)
      })
    }
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`)
      report.recommendations.forEach(rec => {
        console.log(`   ${rec}`)
      })
    }
    
    console.log('\n' + '='.repeat(80))
  }
  
  private async updateBaselines(): Promise<void> {
    // Update baselines with current results
    const newBaselines: Record<string, number> = {}
    
    this.results.forEach(result => {
      if (result.status === 'pass') {
        // Only update baselines with good results
        newBaselines[result.metric] = result.value
      } else if (!this.baselines.has(result.metric)) {
        // Set initial baseline even if not optimal
        newBaselines[result.metric] = result.value
      }
    })
    
    // Merge with existing baselines
    this.baselines.forEach((value, key) => {
      if (!(key in newBaselines)) {
        newBaselines[key] = value
      }
    })
    
    // Save baselines
    const baselinePath = path.join(process.cwd(), 'output', 'performance-baselines.json')
    fs.writeFileSync(baselinePath, JSON.stringify(newBaselines, null, 2))
    
    console.log(`📊 Performance baselines updated`)
  }
  
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

// Main execution
async function main() {
  const benchmark = new PerformanceBenchmark()
  
  try {
    await benchmark.runFullBenchmark()
  } catch (error) {
    console.error('❌ Performance benchmark failed:', error)
    process.exit(1)
  } finally {
    await benchmark.cleanup()
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Benchmark failed:', error)
    process.exit(1)
  })
}

export { PerformanceBenchmark }