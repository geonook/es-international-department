/**
 * Admin Announcements Management API
 * Admin Announcements Management API - Requires admin permissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth, getSearchParams, parsePaginationParams, createApiErrorResponse, createApiSuccessResponse } from '@/lib/auth-utils'
import { requireAdmin } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { withCache, cacheInvalidation, CACHE_TTL } from '@/lib/cache'
import { performance } from 'perf_hooks'

/**
 * GET /api/admin/announcements
 * Get all announcements (including drafts) - Admin only
 */
export async function GET(request: NextRequest) {
  // Check admin permissions
  const authResult = await requireAdminAuth(request)
  if (!authResult.success) {
    return authResult.response!
  }
  const adminUser = authResult.user!

  try {
    const searchParams = getSearchParams(request)
    const { page, limit } = parsePaginationParams(searchParams)
    const status = searchParams.get('status')
    const targetAudience = searchParams.get('targetAudience')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build query conditions
    const whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    if (targetAudience) {
      whereClause.targetAudience = targetAudience
    }

    if (priority) {
      whereClause.priority = priority
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Generate cache key based on query parameters
    const cacheKey = `announcements:admin:${JSON.stringify({ page, limit, status, targetAudience, priority, search })}`
    
    // Use caching for better performance
    const result = await withCache(
      cacheKey,
      async () => {
        const startTime = performance.now()
        
        // Add type filter for announcements
        const announcementWhere = { ...whereClause, type: 'announcement' }
        
        const [announcements, totalCount] = await Promise.all([
          prisma.communication.findMany({
            where: announcementWhere,
            where: whereClause,
            skip,
            take: limit,
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  displayName: true,
                  firstName: true,
                  lastName: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }),
          prisma.communication.count({ where: announcementWhere })
        ])
        
        const queryTime = performance.now() - startTime
        
        // Log slow queries
        if (queryTime > 200) {
          console.warn(`🐌 Slow announcements query: ${queryTime.toFixed(2)}ms`)
        }
        
        return { announcements, totalCount, queryTime }
      },
      CACHE_TTL.SHORT // Cache for 1 minute
    )
    
    const { announcements, totalCount, queryTime } = result

    const response = createApiSuccessResponse({
      announcements,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      performance: {
        queryTime: queryTime?.toFixed(2) || 'cached',
        cached: !queryTime
      }
    })
    
    // Add cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return response

  } catch (error) {
    console.error('Admin announcements list error:', error)
    return createApiErrorResponse('Failed to fetch announcements list', 500, 'FETCH_ANNOUNCEMENTS_ERROR')
  }
}

/**
 * POST /api/admin/announcements
 * Create new announcement - Admin only
 */
export async function POST(request: NextRequest) {
  // Check admin permissions
  const adminUser = await requireAdmin(request)
  if (adminUser instanceof NextResponse) {
    return adminUser
  }

  try {
    const body = await request.json()
    const {
      title,
      content,
      summary,
      targetAudience = 'all',
      priority = 'medium',
      status = 'draft',
      publishedAt,
      expiresAt
    } = body

    // Basic validation
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Title and content are required fields'
        },
        { status: 400 }
      )
    }

    // Validate targetAudience
    const validAudiences = ['teachers', 'parents', 'all']
    if (!validAudiences.includes(targetAudience)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid target audience',
          message: 'Target audience must be teachers, parents or all'
        },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid priority',
          message: 'Priority must be low, medium or high'
        },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['draft', 'published', 'archived']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status',
          message: 'Status must be draft, published or archived'
        },
        { status: 400 }
      )
    }

    // Create announcement
    const startTime = performance.now()
    
    const newAnnouncement = await prisma.communication.create({
      data: {
        title,
        content,
        summary,
        type: 'announcement', // Set type for announcements
        targetAudience,
        priority,
        status,
        authorId: adminUser.id,
        publishedAt: publishedAt ? new Date(publishedAt) : (status === 'published' ? new Date() : null),
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
    
    const createTime = performance.now() - startTime
    
    // Invalidate announcements cache after creation
    cacheInvalidation.announcements()

    return NextResponse.json({
      success: true,
      data: { announcement: newAnnouncement },
      message: 'Announcement created successfully',
      performance: {
        createTime: createTime.toFixed(2) + 'ms'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Admin create announcement error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create announcement',
        message: 'Failed to create announcement'
      },
      { status: 500 }
    )
  }
}