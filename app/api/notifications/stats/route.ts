import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getConnectionStats } from '../stream/route'

/**
 * Notification Statistics API - /api/notifications/stats
 * Notification Statistics API
 * 
 * @description Provide notification system statistics, including unread counts, SSE connection status, etc.
 * @features Notification statistics, connection monitoring, performance metrics
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/notifications/stats
 * Get notification statistics
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'UNAUTHORIZED',
          message: 'Unauthorized access' 
        }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeConnectionStats = searchParams.get('includeConnectionStats') === 'true'
    const isUserAdmin = isAdmin(currentUser)

    // Get user notification statistics
    const now = new Date()
    const [
      totalNotifications,
      unreadNotifications,
      readNotifications,
      recentNotifications
    ] = await Promise.all([
      // Total notifications
      prisma.notification.count({
        where: { 
          recipientId: currentUser.id,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      }),
      
      // Unread notifications
      prisma.notification.count({
        where: { 
          recipientId: currentUser.id,
          isRead: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      }),
      
      // Read notifications
      prisma.notification.count({
        where: { 
          recipientId: currentUser.id,
          isRead: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      }),
      
      // Recent 24 hours notifications
      prisma.notification.count({
        where: { 
          recipientId: currentUser.id,
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      })
    ])

    // Statistics by type (user's own notifications only)
    const notificationsByType = await prisma.notification.groupBy({
      by: ['type'],
      where: {
        recipientId: currentUser.id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      _count: {
        id: true
      }
    })

    // Statistics by priority (user's own notifications only)
    const notificationsByPriority = await prisma.notification.groupBy({
      by: ['priority'],
      where: {
        recipientId: currentUser.id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      _count: {
        id: true
      }
    })

    const stats = {
      user: {
        total: totalNotifications,
        unread: unreadNotifications,
        read: readNotifications,
        recent: recentNotifications,
        byType: notificationsByType.reduce((acc, item) => {
          acc[item.type as string] = item._count.id
          return acc
        }, {} as Record<string, number>),
        byPriority: notificationsByPriority.reduce((acc, item) => {
          acc[item.priority as string] = item._count.id
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Admins can view system statistics
    let systemStats = null
    if (isUserAdmin) {
      const [
        totalUsers,
        totalSystemNotifications,
        unreadSystemNotifications
      ] = await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        
        prisma.notification.count({
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } }
            ]
          }
        }),
        
        prisma.notification.count({
          where: {
            isRead: false,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } }
            ]
          }
        })
      ])

      systemStats = {
        totalUsers,
        totalNotifications: totalSystemNotifications,
        unreadNotifications: unreadSystemNotifications,
        averageNotificationsPerUser: totalUsers > 0 ? Math.round(totalSystemNotifications / totalUsers) : 0
      }
    }

    const response: any = {
      success: true,
      data: stats,
      timestamp: now.toISOString()
    }

    // Add system statistics (admin only)
    if (systemStats) {
      response.system = systemStats
    }

    // Add connection statistics (if requested)
    if (includeConnectionStats && (isUserAdmin || process.env.NODE_ENV === 'development')) {
      try {
        const connectionStats = getConnectionStats()
        response.connections = {
          active: connectionStats.activeConnections,
          total: connectionStats.totalConnections,
          userConnections: connectionStats.connectionsByUser.size,
          errors: connectionStats.errors,
          reconnections: connectionStats.reconnections,
          details: isUserAdmin ? connectionStats.activeConnectionDetails : undefined
        }
      } catch (error) {
        console.warn('Failed to get connection stats:', error)
        response.connections = {
          error: 'Failed to retrieve connection statistics'
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get notification stats error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'INTERNAL_ERROR',
        message: 'Failed to get notification statistics' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/stats
 * Record notification statistics events (internal use)
 */
export async function POST(request: NextRequest) {
  try {
    // This endpoint can be used to record various notification statistics events
    // For example: notification open rate, click rate, etc.
    
    const currentUser = await getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'UNAUTHORIZED',
          message: 'Insufficient permissions' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { eventType, data } = body

    // Here we can expand different types of statistics event recording
    console.log('Notification stats event:', { eventType, data, userId: currentUser.id })

    return NextResponse.json({
      success: true,
      message: 'Statistics event recorded'
    })

  } catch (error) {
    console.error('Record notification stats error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'INTERNAL_ERROR',
        message: 'Failed to record statistics event' 
      },
      { status: 500 }
    )
  }
}