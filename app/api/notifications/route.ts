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

export const dynamic = 'force-dynamic'

/**
 * Notifications API - /api/notifications
 * Notification System API
 * 
 * @description Handle user notification retrieval, creation and management
 * @features Notification list, pagination, filtering, statistics, send notifications
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/notifications
 * Get user notification list
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

    const userId = currentUser.id
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') as NotificationType | 'all' | null
    const priority = searchParams.get('priority') as NotificationPriority | 'all' | null
    const status = searchParams.get('status') as 'unread' | 'read' | 'all' | null
    const search = searchParams.get('search')
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')

    // Build filter conditions
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

    // Exclude expired notifications
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    ]

    // Calculate total count and pagination
    const totalCount = await prisma.notification.count({ where })
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // Get notification list
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
        { isRead: 'asc' },  // Unread first
        { priority: 'desc' }, // High priority first
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // Calculate statistics
    const stats: NotificationStats = await calculateStats(userId)

    // Build filter info
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

    // Build pagination info
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
      { success: false, message: 'Failed to get notification list' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 * Send new notification (admin function)
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

    // Parse request data
    const data: NotificationFormData = await request.json()

    // Validate required fields
    if (!data.title || !data.message || !data.type || !data.priority) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send notification
    const result = await NotificationService.sendNotification(data)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Notification sent to ${result.totalSent} users`,
        data: result
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send notification',
        data: result
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

/**
 * Calculate user notification statistics
 */
async function calculateStats(userId: string): Promise<NotificationStats> {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Basic statistics
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

  // Statistics by type
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

  // Statistics by priority
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
    archived: 0, // Temporarily 0, needs schema support for archived status
    byType,
    byPriority,
    recent,
    thisWeek,
    thisMonth
  }
}

export { calculateStats }