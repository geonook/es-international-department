/**
 * Performance Monitoring API Endpoint
 * Admin Performance Monitoring API - /api/admin/performance
 * 
 * @description Provides performance metrics and database optimization insights
 * @features Query performance monitoring, slow query detection, system health
 * @author Claude Code | Generated for KCISLK ESID Info Hub Performance Optimization
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'
import { performanceMonitor, generatePerformanceReport } from '@/lib/performance'
import { performHealthCheck } from '@/lib/prisma'

/**
 * GET /api/admin/performance
 * Get performance metrics and system health
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Unauthorized access' 
        }, 
        { status: 401 }
      )
    }

    // Check admin permissions
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions' 
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'summary'

    // Generate different types of reports
    switch (type) {
      case 'health':
        const healthData = await performHealthCheck()
        return NextResponse.json({
          success: true,
          data: healthData,
          type: 'health'
        })

      case 'slow-queries':
        const slowQueriesReport = performanceMonitor.getSlowQueriesReport()
        return NextResponse.json({
          success: true,
          data: {
            report: slowQueriesReport,
            metrics: performanceMonitor.getMetrics()
          },
          type: 'slow-queries'
        })

      case 'summary':
      default:
        const performanceReport = generatePerformanceReport()
        const databaseHealth = await performHealthCheck()
        
        return NextResponse.json({
          success: true,
          data: {
            ...performanceReport,
            databaseHealth
          },
          type: 'summary'
        })
    }

  } catch (error) {
    console.error('Performance monitoring API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get performance metrics' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/performance
 * Clear performance metrics or run optimization tasks
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Unauthorized access' 
        }, 
        { status: 401 }
      )
    }

    // Check admin permissions
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions' 
        },
        { status: 403 }
      )
    }

    const { action } = await request.json()

    switch (action) {
      case 'clear-metrics':
        performanceMonitor.clearMetrics()
        return NextResponse.json({
          success: true,
          message: 'Performance metrics cleared successfully'
        })

      case 'set-threshold':
        const { threshold } = await request.json()
        if (typeof threshold === 'number' && threshold > 0) {
          performanceMonitor.setSlowQueryThreshold(threshold)
          return NextResponse.json({
            success: true,
            message: `Slow query threshold set to ${threshold}ms`
          })
        } else {
          return NextResponse.json(
            { success: false, message: 'Invalid threshold value' },
            { status: 400 }
          )
        }

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Performance management API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to perform action' },
      { status: 500 }
    )
  }
}