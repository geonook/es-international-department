/**
 * Resource Analytics API - ES International Department
 * 資源分析 API - ES 國際部
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin permission
    const userRoles = await prisma.userRole.findMany({
      where: { userId: currentUser.id },
      include: { role: true }
    })
    
    const isAdmin = userRoles.some(ur => ur.role.name === 'admin')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeRange = parseInt(searchParams.get('timeRange') || '30')
    const categoryId = searchParams.get('categoryId')
    const gradeLevelId = searchParams.get('gradeLevelId')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - timeRange)

    // Build where clause for filtering
    const whereClause: any = {}
    if (categoryId) {
      whereClause.categoryId = parseInt(categoryId)
    }
    if (gradeLevelId) {
      whereClause.gradeLevelId = parseInt(gradeLevelId)
    }

    // Get all resources with filters
    const resources = await prisma.resource.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        },
        gradeLevel: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    })

    // Calculate basic statistics
    const stats = {
      total: resources.length,
      published: resources.filter(r => r.status === 'published').length,
      draft: resources.filter(r => r.status === 'draft').length,
      archived: resources.filter(r => r.status === 'archived').length,
      featured: resources.filter(r => r.isFeatured).length,
      totalDownloads: resources.reduce((sum, r) => sum + r.downloadCount, 0),
      totalViews: resources.reduce((sum, r) => sum + r.viewCount, 0),
      avgDownloadsPerResource: resources.length > 0 
        ? resources.reduce((sum, r) => sum + r.downloadCount, 0) / resources.length 
        : 0,
      avgViewsPerResource: resources.length > 0 
        ? resources.reduce((sum, r) => sum + r.viewCount, 0) / resources.length 
        : 0,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byGradeLevel: {} as Record<string, number>,
      popularResources: [],
      categoryPerformance: []
    }

    // Group by type
    resources.forEach(resource => {
      stats.byType[resource.resourceType] = (stats.byType[resource.resourceType] || 0) + 1
      
      if (resource.category) {
        stats.byCategory[resource.category.displayName] = 
          (stats.byCategory[resource.category.displayName] || 0) + 1
      }
      
      if (resource.gradeLevel) {
        stats.byGradeLevel[resource.gradeLevel.displayName] = 
          (stats.byGradeLevel[resource.gradeLevel.displayName] || 0) + 1
      }
    })

    // Get popular resources (top 10 by engagement)
    const popularResources = resources
      .map(resource => ({
        id: resource.id,
        title: resource.title,
        downloadCount: resource.downloadCount,
        viewCount: resource.viewCount,
        resourceType: resource.resourceType,
        category: resource.category?.displayName,
        engagement: resource.downloadCount + (resource.viewCount * 0.1) // Weight downloads more than views
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10)
      .map(({ engagement, ...rest }) => rest) // Remove engagement score from final result

    stats.popularResources = popularResources as any

    // Calculate category performance
    const categoryPerformance = Object.entries(
      resources.reduce((acc, resource) => {
        const categoryName = resource.category?.displayName || 'Uncategorized'
        if (!acc[categoryName]) {
          acc[categoryName] = {
            categoryName,
            resourceCount: 0,
            totalDownloads: 0,
            totalViews: 0,
            avgEngagement: 0
          }
        }
        acc[categoryName].resourceCount++
        acc[categoryName].totalDownloads += resource.downloadCount
        acc[categoryName].totalViews += resource.viewCount
        return acc
      }, {} as Record<string, any>)
    ).map(([name, data]) => ({
      ...data,
      avgEngagement: data.resourceCount > 0 
        ? (data.totalDownloads + (data.totalViews * 0.1)) / data.resourceCount 
        : 0
    })).sort((a, b) => b.avgEngagement - a.avgEngagement)

    stats.categoryPerformance = categoryPerformance

    // Generate recent activity (mock data for demonstration - you might want to implement actual activity tracking)
    const recentActivity = []
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // This is mock data - in a real implementation, you'd query actual activity logs
      const dayResources = resources.filter(r => {
        const createdDate = new Date(r.createdAt)
        return createdDate.toDateString() === date.toDateString()
      })
      
      recentActivity.push({
        date: date.toISOString().split('T')[0],
        uploads: dayResources.length,
        downloads: Math.floor(Math.random() * 50), // Mock data
        views: Math.floor(Math.random() * 200) // Mock data
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        recentActivity,
        timeRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: timeRange
        }
      }
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}