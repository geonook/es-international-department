import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getConnectionStats } from '../stream/route'

/**
 * Notification Statistics API - /api/notifications/stats
 * 通知統計 API
 * 
 * @description 提供通知系統統計資訊，包括未讀數量、SSE連接狀態等
 * @features 通知統計、連接監控、性能指標
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/notifications/stats
 * 獲取通知統計資訊
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'UNAUTHORIZED',
          message: '未授權訪問' 
        }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeConnectionStats = searchParams.get('includeConnectionStats') === 'true'
    const isUserAdmin = isAdmin(currentUser)

    // 獲取用戶通知統計
    const now = new Date()
    const [
      totalNotifications,
      unreadNotifications,
      readNotifications,
      recentNotifications
    ] = await Promise.all([
      // 總通知數
      prisma.notification.count({
        where: { 
          recipientId: currentUser.id,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      }),
      
      // 未讀通知數
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
      
      // 已讀通知數
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
      
      // 最近24小時通知數
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

    // 按類型統計（僅限用戶自己的通知）
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

    // 按優先級統計（僅限用戶自己的通知）
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

    // 管理員可以看到系統統計
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

    // 添加系統統計（僅管理員）
    if (systemStats) {
      response.system = systemStats
    }

    // 添加連接統計（如果請求）
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
        message: '獲取通知統計失敗' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/stats
 * 記錄通知統計事件（內部使用）
 */
export async function POST(request: NextRequest) {
  try {
    // 這個端點可以用於記錄各種通知統計事件
    // 例如：通知開啟率、點擊率等
    
    const currentUser = await getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'UNAUTHORIZED',
          message: '權限不足' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { eventType, data } = body

    // 這裡可以擴展不同類型的統計事件記錄
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
        message: '記錄統計事件失敗' 
      },
      { status: 500 }
    )
  }
}