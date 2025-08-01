/**
 * Announcements API - List and Create
 * 公告 API - 列表查詢與建立端點
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, isAdmin, isTeacher, AUTH_ERRORS } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/announcements - 取得公告列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 分頁參數
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // 篩選參數
    const targetAudience = searchParams.get('targetAudience')
    const priority = searchParams.get('priority') 
    const status = searchParams.get('status') || 'published' // 預設只顯示已發布的公告
    const search = searchParams.get('search')

    // 建立查詢條件
    const where: any = {}
    
    if (targetAudience && targetAudience !== 'all') {
      where.targetAudience = targetAudience
    }
    
    if (priority) {
      where.priority = priority
    }
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 執行查詢
    const [announcements, totalCount] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' }, // 高優先順序在前
          { publishedAt: 'desc' }, // 最新發布的在前
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.announcement.count({ where })
    ])

    // 計算分頁資訊
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: announcements,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        targetAudience,
        priority,
        status,
        search
      }
    })

  } catch (error) {
    console.error('Get Announcements API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '伺服器內部錯誤' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/announcements - 建立新公告
export async function POST(request: NextRequest) {
  try {
    // 檢查使用者認證
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: '請先登入' 
        },
        { status: 401 }
      )
    }

    // 檢查權限：需要 admin 或 teacher 角色
    if (!isAdmin(currentUser) && !isTeacher(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: '權限不足：需要管理員或教師權限' 
        },
        { status: 403 }
      )
    }

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

    // 驗證必要欄位
    if (!title || !content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title and content are required',
          message: '標題和內容為必填欄位' 
        },
        { status: 400 }
      )
    }

    // 驗證 targetAudience 值
    const validAudiences = ['teachers', 'parents', 'all']
    if (!validAudiences.includes(targetAudience)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid target audience',
          message: '無效的目標對象' 
        },
        { status: 400 }
      )
    }

    // 驗證 priority 值
    const validPriorities = ['low', 'medium', 'high']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid priority',
          message: '無效的優先等級' 
        },
        { status: 400 }
      )
    }

    // 驗證 status 值
    const validStatuses = ['draft', 'published', 'archived']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid status',
          message: '無效的狀態' 
        },
        { status: 400 }
      )
    }

    // 建立公告資料
    const announcementData: any = {
      title,
      content,
      summary,
      authorId: currentUser.id,
      targetAudience,
      priority,
      status
    }

    // 處理發布時間
    if (status === 'published' && !publishedAt) {
      announcementData.publishedAt = new Date()
    } else if (publishedAt) {
      announcementData.publishedAt = new Date(publishedAt)
    }

    // 處理到期時間
    if (expiresAt) {
      announcementData.expiresAt = new Date(expiresAt)
    }

    // 建立公告
    const announcement = await prisma.announcement.create({
      data: announcementData,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '公告建立成功',
      data: announcement
    }, { status: 201 })

  } catch (error) {
    console.error('Create Announcement API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '建立公告失敗，請稍後再試' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// 不支援的 HTTP 方法
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}