/**
 * Admin Announcements Management API
 * 管理員公告管理 API - 需要管理員權限
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { withCache, cacheInvalidation, CACHE_TTL } from '@/lib/cache'
import { performance } from 'perf_hooks'

/**
 * GET /api/admin/announcements
 * 獲取所有公告 (包含草稿) - 管理員專用
 */
export async function GET(request: NextRequest) {
  // 檢查管理員權限
  const adminUser = await requireAdmin(request)
  if (adminUser instanceof NextResponse) {
    return adminUser
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const targetAudience = searchParams.get('targetAudience')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // 建構查詢條件
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
        
        const [announcements, totalCount] = await Promise.all([
          prisma.announcement.findMany({
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
          prisma.announcement.count({ where: whereClause })
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

    return NextResponse.json(
      {
        success: true,
        data: {
          announcements,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        },
        performance: {
          queryTime: queryTime?.toFixed(2) || 'cached',
          cached: !queryTime
        }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
      }
    )

  } catch (error) {
    console.error('Admin announcements list error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch announcements',
        message: '獲取公告列表失敗'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/announcements
 * 創建新公告 - 管理員專用
 */
export async function POST(request: NextRequest) {
  // 檢查管理員權限
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

    // 基本驗證
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: '標題和內容為必填欄位'
        },
        { status: 400 }
      )
    }

    // 驗證 targetAudience
    const validAudiences = ['teachers', 'parents', 'all']
    if (!validAudiences.includes(targetAudience)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid target audience',
          message: '目標對象必須是 teachers、parents 或 all'
        },
        { status: 400 }
      )
    }

    // 驗證 priority
    const validPriorities = ['low', 'medium', 'high']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid priority',
          message: '優先級必須是 low、medium 或 high'
        },
        { status: 400 }
      )
    }

    // 驗證 status
    const validStatuses = ['draft', 'published', 'archived']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status',
          message: '狀態必須是 draft、published 或 archived'
        },
        { status: 400 }
      )
    }

    // 創建公告
    const startTime = performance.now()
    
    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        summary,
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
      message: '公告創建成功',
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
        message: '創建公告失敗'
      },
      { status: 500 }
    )
  }
}