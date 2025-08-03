import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'
import NotificationService from '@/lib/notificationService'
import { 
  NotificationFilters, 
  NotificationFormData,
  NotificationStats,
  NotificationType,
  NotificationPriority 
} from '@/lib/types'

/**
 * Notifications API - /api/notifications
 * 通知系統 API
 * 
 * @description 處理用戶通知的獲取、創建和管理
 * @features 通知列表、分頁、篩選、統計、發送通知
 * @author Claude Code | Generated for ES International Department
 */

/**
 * GET /api/notifications
 * 獲取用戶通知列表
 */
export async function GET(request: NextRequest) {
  try {
    // 驗證用戶身份
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: '未授權訪問' 
        }, 
        { status: 401 }
      )
    }

    const userId = currentUser.id
    const { searchParams } = new URL(request.url)

    // 解析查詢參數
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') as NotificationType | 'all' | null
    const priority = searchParams.get('priority') as NotificationPriority | 'all' | null
    const status = searchParams.get('status') as 'unread' | 'read' | 'all' | null
    const search = searchParams.get('search')
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')

    // 構建篩選條件
    const where: any = {
      recipientId: userId
    }

    if (type && type !== 'all') {
      where.type = type
    }

    if (priority && priority !== 'all') {
      where.priority = priority
    }

    if (status && status !== 'all') {
      where.isRead = status === 'read'
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateStart || dateEnd) {
      where.createdAt = {}
      if (dateStart) {
        where.createdAt.gte = new Date(dateStart)
      }
      if (dateEnd) {
        where.createdAt.lte = new Date(dateEnd)
      }
    }

    // 排除過期通知
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    ]

    // 計算總數和分頁
    const totalCount = await prisma.notification.count({ where })
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // 獲取通知列表
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        recipient: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { isRead: 'asc' },  // 未讀優先
        { priority: 'desc' }, // 高優先級優先
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // 計算統計資訊
    const stats: NotificationStats = await calculateStats(userId)

    // 構建篩選資訊
    const filters: NotificationFilters = {
      type: type || 'all',
      priority: priority || 'all',
      status: status || 'all',
      search: search || undefined,
      dateRange: {
        start: dateStart || undefined,
        end: dateEnd || undefined
      }
    }

    // 構建分頁資訊
    const pagination = {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination,
      stats,
      filters
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, message: '獲取通知列表失敗' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 * 發送新通知（管理員功能）
 */
export async function POST(request: NextRequest) {
  try {
    // 驗證用戶身份
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: '未授權訪問' 
        }, 
        { status: 401 }
      )
    }

    // 檢查管理員權限
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: '權限不足' 
        },
        { status: 403 }
      )
    }

    // 解析請求資料
    const data: NotificationFormData = await request.json()

    // 驗證必填欄位
    if (!data.title || !data.message || !data.type || !data.priority) {
      return NextResponse.json(
        { success: false, message: '缺少必填欄位' },
        { status: 400 }
      )
    }

    // 發送通知
    const result = await NotificationService.sendNotification(data)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `通知已發送給 ${result.totalSent} 位用戶`,
        data: result
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '發送通知失敗',
        data: result
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { success: false, message: '發送通知失敗' },
      { status: 500 }
    )
  }
}

/**
 * 計算用戶通知統計
 */
async function calculateStats(userId: string): Promise<NotificationStats> {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // 基本統計
  const [
    total,
    unread,
    read,
    recent,
    thisWeek,
    thisMonth
  ] = await Promise.all([
    prisma.notification.count({
      where: { 
        recipientId: userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    }),
    prisma.notification.count({
      where: { 
        recipientId: userId,
        isRead: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    }),
    prisma.notification.count({
      where: { 
        recipientId: userId,
        isRead: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    }),
    prisma.notification.count({
      where: { 
        recipientId: userId,
        createdAt: { gte: oneDayAgo },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    }),
    prisma.notification.count({
      where: { 
        recipientId: userId,
        createdAt: { gte: oneWeekAgo },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    }),
    prisma.notification.count({
      where: { 
        recipientId: userId,
        createdAt: { gte: oneMonthAgo },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    })
  ])

  // 按類型統計
  const byTypeResults = await prisma.notification.groupBy({
    by: ['type'],
    where: {
      recipientId: userId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ]
    },
    _count: true
  })

  const byType: Record<NotificationType, number> = {
    system: 0,
    announcement: 0,
    event: 0,
    registration: 0,
    resource: 0,
    newsletter: 0,
    maintenance: 0,
    reminder: 0
  }

  byTypeResults.forEach(result => {
    byType[result.type as NotificationType] = result._count
  })

  // 按優先級統計
  const byPriorityResults = await prisma.notification.groupBy({
    by: ['priority'],
    where: {
      recipientId: userId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ]
    },
    _count: true
  })

  const byPriority: Record<NotificationPriority, number> = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0
  }

  byPriorityResults.forEach(result => {
    byPriority[result.priority as NotificationPriority] = result._count
  })

  return {
    total,
    unread,
    read,
    archived: 0, // 暫時為0，需要schema支援archived狀態
    byType,
    byPriority,
    recent,
    thisWeek,
    thisMonth
  }
}

export { calculateStats }