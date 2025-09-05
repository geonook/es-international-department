#!/usr/bin/env tsx

/**
 * N+1 Query Detection and Analysis System
 * KCISLK ESID Info Hub - Advanced Performance Monitoring
 * 
 * This script detects N+1 query patterns in the application and provides 
 * optimization recommendations based on actual usage patterns.
 */

import { PrismaClient } from '@prisma/client'
import { performance } from 'perf_hooks'
import fs from 'fs'
import path from 'path'

interface QueryAnalysis {
  query: string
  model: string
  action: string
  duration: number
  timestamp: string
  args: any
  stackTrace?: string
  parentQuery?: string
}

interface NPlusOnePattern {
  severity: 'critical' | 'warning' | 'info'
  pattern: string
  description: string
  examples: QueryAnalysis[]
  totalQueries: number
  totalTime: number
  recommendation: string
  optimizationCode?: string
}

interface PerformanceIssue {
  type: 'n+1' | 'slow-query' | 'duplicate-query' | 'inefficient-include'
  severity: 'critical' | 'warning' | 'info'
  description: string
  occurrences: number
  totalTime: number
  examples: QueryAnalysis[]
  recommendation: string
}

class NPlusOneDetector {
  private prisma: PrismaClient
  private queryLog: QueryAnalysis[] = []
  private patterns: NPlusOnePattern[] = []
  private issues: PerformanceIssue[] = []
  private analysisStartTime: number = 0
  private duplicateQueryMap = new Map<string, QueryAnalysis[]>()
  
  constructor() {
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    })
    
    this.setupQueryLogging()
  }
  
  private setupQueryLogging() {
    // Enhanced Prisma middleware for detailed query analysis
    this.prisma.$use(async (params, next) => {
      const before = performance.now()
      const stackTrace = new Error().stack
      
      const result = await next(params)
      
      const after = performance.now()
      const duration = after - before
      
      const queryKey = `${params.model}.${params.action}:${JSON.stringify(params.args)}`
      
      const analysis: QueryAnalysis = {
        query: `${params.model}.${params.action}`,
        model: params.model || 'unknown',
        action: params.action,
        duration,
        timestamp: new Date().toISOString(),
        args: params.args,
        stackTrace: stackTrace?.split('\n').slice(0, 5).join('\n')
      }
      
      this.queryLog.push(analysis)
      
      // Track duplicate queries
      if (!this.duplicateQueryMap.has(queryKey)) {
        this.duplicateQueryMap.set(queryKey, [])
      }
      this.duplicateQueryMap.get(queryKey)!.push(analysis)
      
      // Log slow queries immediately
      if (duration > 100) {
        console.warn(`🐌 Slow Query Alert: ${params.model}.${params.action} took ${duration.toFixed(2)}ms`)
      }
      
      return result
    })
    
    // Listen to query events for additional context
    this.prisma.$on('query', (e) => {
      if (this.queryLog.length > 0) {
        const lastQuery = this.queryLog[this.queryLog.length - 1]
        if (lastQuery && Math.abs(new Date().getTime() - new Date(lastQuery.timestamp).getTime()) < 10) {
          // Add SQL query text for better analysis
          lastQuery.query = `${lastQuery.query} [SQL: ${e.query.substring(0, 100)}...]`
        }
      }
    })
  }
  
  async startAnalysis(): Promise<void> {
    console.log('🔍 Starting N+1 Query Detection Analysis...')
    console.log('📊 This will simulate various application scenarios to detect performance issues\n')
    
    this.analysisStartTime = performance.now()
    
    // Clear previous logs
    this.queryLog = []
    this.patterns = []
    this.issues = []
    this.duplicateQueryMap.clear()
    
    // Run comprehensive analysis scenarios
    await this.runAnalysisScenarios()
    
    // Analyze patterns
    await this.analyzeQueryPatterns()
    
    // Generate report
    await this.generateAnalysisReport()
  }
  
  private async runAnalysisScenarios(): Promise<void> {
    const scenarios = [
      {
        name: '📚 Resource Listing with Relations',
        test: () => this.testResourceListing()
      },
      {
        name: '📅 Event Listing with Registrations',
        test: () => this.testEventListing()
      },
      {
        name: '👥 User Management Scenarios',
        test: () => this.testUserManagement()
      },
      {
        name: '📢 Announcement and Communication Loading',
        test: () => this.testCommunicationLoading()
      },
      {
        name: '🔔 Notification System Analysis',
        test: () => this.testNotificationSystem()
      },
      {
        name: '🏷️ Complex Resource Tag Scenarios',
        test: () => this.testComplexTagging()
      }
    ]
    
    for (const scenario of scenarios) {
      console.log(`\n🧪 Testing: ${scenario.name}`)
      const start = performance.now()
      
      try {
        await scenario.test()
        const end = performance.now()
        console.log(`   ✅ Completed in ${(end - start).toFixed(2)}ms`)
      } catch (error) {
        console.log(`   ❌ Failed: ${error}`)
      }
    }
  }
  
  private async testResourceListing(): Promise<void> {
    // Test potential N+1 scenarios in resource loading
    
    // Scenario 1: Load resources without proper includes (BAD)
    console.log('   📋 Testing resource listing without includes...')
    const resources = await this.prisma.resource.findMany({ take: 5 })
    
    // This would trigger N+1 queries
    for (const resource of resources) {
      try {
        await this.prisma.user.findUnique({ where: { id: resource.createdBy } })
        await this.prisma.resourceCategory.findUnique({ where: { id: resource.categoryId } })
        if (resource.gradeLevelId) {
          await this.prisma.gradeLevel.findUnique({ where: { id: resource.gradeLevelId } })
        }
      } catch (error) {
        // Skip if relations don't exist yet
      }
    }
    
    // Scenario 2: Load resources with proper includes (GOOD)
    console.log('   📋 Testing resource listing with includes...')
    await this.prisma.resource.findMany({
      take: 5,
      include: {
        creator: { select: { displayName: true, email: true } },
        category: true,
        gradeLevel: true,
        tags: { include: { tag: true } }
      }
    })
  }
  
  private async testEventListing(): Promise<void> {
    console.log('   📅 Testing event listing scenarios...')
    
    // N+1 scenario: Load events then their registrations separately
    const events = await this.prisma.event.findMany({ take: 3 })
    
    for (const event of events) {
      try {
        await this.prisma.eventRegistration.findMany({ 
          where: { eventId: event.id },
          take: 5
        })
        await this.prisma.user.findUnique({ where: { id: event.createdBy } })
      } catch (error) {
        // Skip if relations don't exist
      }
    }
    
    // Optimized version
    await this.prisma.event.findMany({
      take: 3,
      include: {
        creator: { select: { displayName: true } },
        registrations: {
          take: 5,
          include: { user: { select: { displayName: true } } }
        }
      }
    })
  }
  
  private async testUserManagement(): Promise<void> {
    console.log('   👥 Testing user management scenarios...')
    
    // Load users and their roles separately (N+1 potential)
    const users = await this.prisma.user.findMany({ take: 5 })
    
    for (const user of users) {
      try {
        await this.prisma.userRole.findMany({ 
          where: { userId: user.id },
          include: { role: true }
        })
        await this.prisma.account.findMany({ where: { userId: user.id } })
      } catch (error) {
        // Skip if relations don't exist
      }
    }
    
    // Optimized version
    await this.prisma.user.findMany({
      take: 5,
      include: {
        roles: { include: { role: true } },
        accounts: true
      }
    })
  }
  
  private async testCommunicationLoading(): Promise<void> {
    console.log('   📢 Testing communication loading...')
    
    // Load announcements and their creators separately
    const announcements = await this.prisma.announcement.findMany({ take: 3 })
    
    for (const announcement of announcements) {
      try {
        await this.prisma.user.findUnique({ where: { id: announcement.createdBy } })
      } catch (error) {
        // Skip if relations don't exist
      }
    }
    
    // Test communication threads
    const communications = await this.prisma.communication.findMany({ take: 3 })
    
    for (const comm of communications) {
      try {
        await this.prisma.communicationReply.findMany({ 
          where: { communicationId: comm.id },
          take: 5
        })
      } catch (error) {
        // Skip if relations don't exist
      }
    }
  }
  
  private async testNotificationSystem(): Promise<void> {
    console.log('   🔔 Testing notification scenarios...')
    
    try {
      // Load notifications and their recipients separately (potential N+1)
      const notifications = await this.prisma.notification.findMany({ take: 5 })
      
      for (const notification of notifications) {
        await this.prisma.user.findUnique({ where: { id: notification.recipientId } })
      }
      
      // Optimized version
      await this.prisma.notification.findMany({
        take: 5,
        include: {
          recipient: { select: { displayName: true, email: true } }
        }
      })
    } catch (error) {
      console.log('   ℹ️ Notification tables may not exist yet')
    }
  }
  
  private async testComplexTagging(): Promise<void> {
    console.log('   🏷️ Testing complex resource tagging...')
    
    try {
      // Complex N+1 scenario with resource tags
      const resources = await this.prisma.resource.findMany({ take: 3 })
      
      for (const resource of resources) {
        const tagRelations = await this.prisma.resourceTagRelation.findMany({
          where: { resourceId: resource.id }
        })
        
        for (const relation of tagRelations) {
          await this.prisma.resourceTag.findUnique({ 
            where: { id: relation.tagId }
          })
        }
      }
      
      // Optimized version with deep includes
      await this.prisma.resource.findMany({
        take: 3,
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      })
    } catch (error) {
      console.log('   ℹ️ Resource tag tables may not exist yet')
    }
  }
  
  private async analyzeQueryPatterns(): Promise<void> {
    console.log('\n🔍 Analyzing query patterns for N+1 issues...')
    
    this.detectNPlusOnePatterns()
    this.detectDuplicateQueries()
    this.detectSlowQueries()
    this.detectInefficientIncludes()
    
    console.log(`📊 Analysis complete. Found ${this.issues.length} potential issues.`)
  }
  
  private detectNPlusOnePatterns(): void {
    // Group queries by time windows to detect N+1 patterns
    const timeWindows = new Map<number, QueryAnalysis[]>()
    const WINDOW_SIZE_MS = 1000 // 1 second windows
    
    this.queryLog.forEach(query => {
      const timeSlot = Math.floor(new Date(query.timestamp).getTime() / WINDOW_SIZE_MS)
      if (!timeWindows.has(timeSlot)) {
        timeWindows.set(timeSlot, [])
      }
      timeWindows.get(timeSlot)!.push(query)
    })
    
    // Analyze each time window for N+1 patterns
    timeWindows.forEach((queries, timeSlot) => {
      this.analyzeWindowForNPlusOne(queries, timeSlot)
    })
  }
  
  private analyzeWindowForNPlusOne(queries: QueryAnalysis[], timeSlot: number): void {
    // Group by model/action
    const queryGroups = new Map<string, QueryAnalysis[]>()
    
    queries.forEach(query => {
      const key = `${query.model}.${query.action}`
      if (!queryGroups.has(key)) {
        queryGroups.set(key, [])
      }
      queryGroups.get(key)!.push(query)
    })
    
    // Check for N+1 patterns (multiple identical queries in short time)
    queryGroups.forEach((groupQueries, queryType) => {
      if (groupQueries.length >= 3) { // 3+ identical queries might indicate N+1
        const totalTime = groupQueries.reduce((sum, q) => sum + q.duration, 0)
        
        // Check if queries are similar but with different parameters
        const similarQueries = this.groupSimilarQueries(groupQueries)
        
        if (similarQueries.length > 0) {
          similarQueries.forEach(group => {
            if (group.length >= 3) {
              this.issues.push({
                type: 'n+1',
                severity: group.length >= 10 ? 'critical' : group.length >= 5 ? 'warning' : 'info',
                description: `Potential N+1 query: ${group.length} similar ${queryType} queries executed in sequence`,
                occurrences: group.length,
                totalTime: group.reduce((sum, q) => sum + q.duration, 0),
                examples: group.slice(0, 3), // Show first 3 examples
                recommendation: this.generateNPlusOneRecommendation(queryType, group)
              })
            }
          })
        }
      }
    })
  }
  
  private groupSimilarQueries(queries: QueryAnalysis[]): QueryAnalysis[][] {
    const groups: QueryAnalysis[][] = []
    const processed = new Set<number>()
    
    queries.forEach((query, index) => {
      if (processed.has(index)) return
      
      const similarGroup = [query]
      processed.add(index)
      
      // Find similar queries (same model/action, different args)
      queries.forEach((otherQuery, otherIndex) => {
        if (otherIndex === index || processed.has(otherIndex)) return
        
        if (this.areQueriesSimilar(query, otherQuery)) {
          similarGroup.push(otherQuery)
          processed.add(otherIndex)
        }
      })
      
      if (similarGroup.length > 1) {
        groups.push(similarGroup)
      }
    })
    
    return groups
  }
  
  private areQueriesSimilar(query1: QueryAnalysis, query2: QueryAnalysis): boolean {
    // Same model and action
    if (query1.model !== query2.model || query1.action !== query2.action) {
      return false
    }
    
    // Check if args structure is similar (likely different IDs)
    const args1Str = JSON.stringify(query1.args)
    const args2Str = JSON.stringify(query2.args)
    
    // Remove specific values to compare structure
    const structure1 = args1Str.replace(/\"[a-zA-Z0-9-_]+\"/g, '"*"')
    const structure2 = args2Str.replace(/\"[a-zA-Z0-9-_]+\"/g, '"*"')
    
    return structure1 === structure2
  }
  
  private detectDuplicateQueries(): void {
    this.duplicateQueryMap.forEach((queries, queryKey) => {
      if (queries.length > 1) {
        const totalTime = queries.reduce((sum, q) => sum + q.duration, 0)
        
        this.issues.push({
          type: 'duplicate-query',
          severity: queries.length >= 5 ? 'warning' : 'info',
          description: `Duplicate queries: Same query executed ${queries.length} times`,
          occurrences: queries.length,
          totalTime,
          examples: queries.slice(0, 2),
          recommendation: 'Consider caching the result or batch loading the data'
        })
      }
    })
  }
  
  private detectSlowQueries(): void {
    const slowQueries = this.queryLog.filter(q => q.duration > 100)
    
    if (slowQueries.length > 0) {
      // Group slow queries by type
      const slowQueryGroups = new Map<string, QueryAnalysis[]>()
      
      slowQueries.forEach(query => {
        const key = `${query.model}.${query.action}`
        if (!slowQueryGroups.has(key)) {
          slowQueryGroups.set(key, [])
        }
        slowQueryGroups.get(key)!.push(query)
      })
      
      slowQueryGroups.forEach((queries, queryType) => {
        const avgTime = queries.reduce((sum, q) => sum + q.duration, 0) / queries.length
        const maxTime = Math.max(...queries.map(q => q.duration))
        
        this.issues.push({
          type: 'slow-query',
          severity: maxTime > 500 ? 'critical' : avgTime > 200 ? 'warning' : 'info',
          description: `Slow queries detected: ${queryType} averages ${avgTime.toFixed(2)}ms (max: ${maxTime.toFixed(2)}ms)`,
          occurrences: queries.length,
          totalTime: queries.reduce((sum, q) => sum + q.duration, 0),
          examples: queries.sort((a, b) => b.duration - a.duration).slice(0, 2),
          recommendation: this.generateSlowQueryRecommendation(queryType, avgTime)
        })
      })
    }
  }
  
  private detectInefficientIncludes(): void {
    // Analyze queries that might benefit from includes
    const findManyQueries = this.queryLog.filter(q => q.action === 'findMany' || q.action === 'findUnique')
    const followupQueries = this.queryLog.filter(q => q.action === 'findUnique' || q.action === 'findFirst')
    
    // Look for patterns where findMany is followed by individual lookups
    findManyQueries.forEach((parentQuery, index) => {
      const nextQueries = followupQueries.filter(q => 
        new Date(q.timestamp).getTime() > new Date(parentQuery.timestamp).getTime() &&
        new Date(q.timestamp).getTime() - new Date(parentQuery.timestamp).getTime() < 2000 // Within 2 seconds
      )
      
      if (nextQueries.length >= 3) {
        this.issues.push({
          type: 'inefficient-include',
          severity: nextQueries.length >= 10 ? 'critical' : 'warning',
          description: `Inefficient data loading: ${parentQuery.model}.${parentQuery.action} followed by ${nextQueries.length} individual queries`,
          occurrences: nextQueries.length + 1,
          totalTime: parentQuery.duration + nextQueries.reduce((sum, q) => sum + q.duration, 0),
          examples: [parentQuery, ...nextQueries.slice(0, 2)],
          recommendation: `Consider using 'include' or 'select' to load related data in a single query`
        })
      }
    })
  }
  
  private generateNPlusOneRecommendation(queryType: string, queries: QueryAnalysis[]): string {
    const [model, action] = queryType.split('.')
    
    const recommendations = {
      'findUnique': `Consider using 'findMany' with 'include' to fetch related data in one query`,
      'findMany': `Use 'include' or 'select' to fetch related data efficiently`,
      'findFirst': `Batch these queries or use 'include' for related data`
    }
    
    const baseRecommendation = recommendations[action] || 'Consider optimizing this query pattern'
    
    // Analyze args to suggest specific includes
    const sampleQuery = queries[0]
    let specificRecommendation = baseRecommendation
    
    if (sampleQuery.args && typeof sampleQuery.args === 'object') {
      const hasWhere = sampleQuery.args.where
      if (hasWhere && Object.keys(hasWhere).length === 1) {
        const whereKey = Object.keys(hasWhere)[0]
        if (whereKey.endsWith('Id')) {
          const relationName = whereKey.replace('Id', '')
          specificRecommendation += `\n\nExample optimization:\n${model}.${action}({\n  include: { ${relationName}: true }\n})`
        }
      }
    }
    
    return specificRecommendation
  }
  
  private generateSlowQueryRecommendation(queryType: string, avgTime: number): string {
    const recommendations = []
    
    if (avgTime > 200) {
      recommendations.push('Add database indexes for commonly queried fields')
    }
    
    if (queryType.includes('findMany')) {
      recommendations.push('Consider adding pagination (take/skip) to limit result size')
      recommendations.push('Use select to fetch only needed fields')
    }
    
    if (queryType.includes('include')) {
      recommendations.push('Review include depth and only include necessary relations')
    }
    
    recommendations.push('Consider adding query-level caching for frequently accessed data')
    
    return recommendations.join('\n• ')
  }
  
  private async generateAnalysisReport(): Promise<void> {
    const analysisEndTime = performance.now()
    const totalAnalysisTime = analysisEndTime - this.analysisStartTime
    
    console.log('\n' + '='.repeat(80))
    console.log('🎯 N+1 QUERY DETECTION ANALYSIS REPORT')
    console.log('='.repeat(80))
    
    // Summary statistics
    const totalQueries = this.queryLog.length
    const totalQueryTime = this.queryLog.reduce((sum, q) => sum + q.duration, 0)
    const avgQueryTime = totalQueries > 0 ? totalQueryTime / totalQueries : 0
    const slowQueryCount = this.queryLog.filter(q => q.duration > 100).length
    
    console.log(`\n📊 Analysis Summary:`)
    console.log(`   • Total Queries Analyzed: ${totalQueries}`)
    console.log(`   • Total Query Time: ${totalQueryTime.toFixed(2)}ms`)
    console.log(`   • Average Query Time: ${avgQueryTime.toFixed(2)}ms`)
    console.log(`   • Slow Queries (>100ms): ${slowQueryCount}`)
    console.log(`   • Analysis Time: ${totalAnalysisTime.toFixed(2)}ms`)
    
    // Issue breakdown
    const issuesByType = new Map<string, PerformanceIssue[]>()
    this.issues.forEach(issue => {
      if (!issuesByType.has(issue.type)) {
        issuesByType.set(issue.type, [])
      }
      issuesByType.get(issue.type)!.push(issue)
    })
    
    const criticalIssues = this.issues.filter(i => i.severity === 'critical')
    const warningIssues = this.issues.filter(i => i.severity === 'warning')
    const infoIssues = this.issues.filter(i => i.severity === 'info')
    
    console.log(`\n🚨 Issues Found:`)
    console.log(`   🔴 Critical: ${criticalIssues.length}`)
    console.log(`   🟡 Warning: ${warningIssues.length}`)
    console.log(`   ℹ️  Info: ${infoIssues.length}`)
    
    // Detailed issue reports
    if (this.issues.length > 0) {
      console.log(`\n📋 Detailed Issue Analysis:`)
      
      const severityOrder = ['critical', 'warning', 'info'] as const
      severityOrder.forEach(severity => {
        const issuesOfSeverity = this.issues.filter(i => i.severity === severity)
        if (issuesOfSeverity.length === 0) return
        
        const emoji = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : 'ℹ️'
        console.log(`\n${emoji} ${severity.toUpperCase()} ISSUES:`)
        
        issuesOfSeverity.forEach((issue, index) => {
          console.log(`\n${index + 1}. ${issue.description}`)
          console.log(`   Type: ${issue.type}`)
          console.log(`   Occurrences: ${issue.occurrences}`)
          console.log(`   Total Time: ${issue.totalTime.toFixed(2)}ms`)
          console.log(`   Recommendation: ${issue.recommendation}`)
          
          if (issue.examples.length > 0) {
            console.log(`   Example Queries:`)
            issue.examples.slice(0, 2).forEach((example, exIndex) => {
              console.log(`     ${exIndex + 1}. ${example.query} (${example.duration.toFixed(2)}ms)`)
            })
          }
        })
      })
    }
    
    // Performance recommendations
    console.log(`\n💡 Performance Optimization Recommendations:`)
    
    if (criticalIssues.length > 0) {
      console.log(`   🔴 CRITICAL ACTIONS NEEDED:`)
      criticalIssues.forEach(issue => {
        console.log(`     • ${issue.description}`)
      })
    }
    
    if (slowQueryCount > totalQueries * 0.1) {
      console.log(`   ⚡ Consider adding database indexes for frequently queried fields`)
    }
    
    if (issuesByType.has('n+1') && issuesByType.get('n+1')!.length > 0) {
      console.log(`   📊 Implement eager loading with 'include' for related data`)
    }
    
    if (issuesByType.has('duplicate-query') && issuesByType.get('duplicate-query')!.length > 0) {
      console.log(`   💾 Add caching layer for frequently accessed data`)
    }
    
    console.log(`   🔄 Consider implementing query batching for bulk operations`)
    console.log(`   📈 Monitor query performance in production with APM tools`)
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      analysis: {
        totalQueries,
        totalQueryTime: Math.round(totalQueryTime * 100) / 100,
        avgQueryTime: Math.round(avgQueryTime * 100) / 100,
        slowQueryCount,
        analysisTime: Math.round(totalAnalysisTime * 100) / 100
      },
      summary: {
        totalIssues: this.issues.length,
        critical: criticalIssues.length,
        warning: warningIssues.length,
        info: infoIssues.length,
        issuesByType: Object.fromEntries(
          Array.from(issuesByType.entries()).map(([type, issues]) => [type, issues.length])
        )
      },
      issues: this.issues,
      queries: this.queryLog,
      healthScore: this.calculatePerformanceScore()
    }
    
    const outputPath = path.join(process.cwd(), 'output', 'n-plus-one-analysis.json')
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
    
    // Performance score
    const performanceScore = this.calculatePerformanceScore()
    console.log(`\n🎯 Performance Score: ${performanceScore}/100`)
    
    if (performanceScore < 60) {
      console.log('❌ Performance needs immediate attention!')
    } else if (performanceScore < 80) {
      console.log('⚠️ Performance could be improved.')
    } else {
      console.log('✅ Performance is in good shape!')
    }
    
    console.log(`\n📄 Detailed report saved to: ${outputPath}`)
    console.log('='.repeat(80))
  }
  
  private calculatePerformanceScore(): number {
    let score = 100
    
    // Deduct points for issues
    this.issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 20
          break
        case 'warning':
          score -= 10
          break
        case 'info':
          score -= 5
          break
      }
    })
    
    // Additional penalties for performance issues
    const slowQueryRatio = this.queryLog.filter(q => q.duration > 100).length / this.queryLog.length
    score -= slowQueryRatio * 30
    
    const avgQueryTime = this.queryLog.reduce((sum, q) => sum + q.duration, 0) / this.queryLog.length
    if (avgQueryTime > 50) {
      score -= Math.min(20, (avgQueryTime - 50) / 5)
    }
    
    return Math.max(0, Math.min(100, Math.round(score)))
  }
  
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

// Main execution
async function main() {
  const detector = new NPlusOneDetector()
  
  try {
    await detector.startAnalysis()
  } catch (error) {
    console.error('❌ N+1 Query Detection failed:', error)
    process.exit(1)
  } finally {
    await detector.cleanup()
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Analysis failed:', error)
    process.exit(1)
  })
}

export { NPlusOneDetector }