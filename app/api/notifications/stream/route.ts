import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

/**
 * Real-time Notifications Stream API - /api/notifications/stream
 * 即時通知串流 API
 * 
 * @description 使用 Server-Sent Events (SSE) 提供即時通知推送
 * @features 即時通知推送、長連接、自動重連
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

// 存儲活躍的 SSE 連接
const activeConnections = new Map<string, {
  controller: ReadableStreamDefaultController<any>
  userId: string
  lastPing: number
  userAgent?: string
  ipAddress?: string
  connectionTime: number
}>()

// 連接限制和監控
const connectionLimits = {
  maxConnectionsPerUser: 3,
  maxTotalConnections: 1000,
  rateLimitWindow: 60 * 1000, // 1分鐘
  maxConnectionsPerMinute: 10
}

// 速率限制追蹤
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

// 連接統計
const connectionStats = {
  totalConnections: 0,
  activeConnections: 0,
  connectionsByUser: new Map<string, number>(),
  reconnections: 0,
  errors: 0
}

/**
 * GET /api/notifications/stream
 * 建立 SSE 連接用於即時通知推送
 */
export async function GET(request: NextRequest) {
  try {
    // 驗證用戶身份 - 更安全的 header 驗證
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return new NextResponse(JSON.stringify({ 
        error: 'Unauthorized', 
        code: 'AUTH_REQUIRED' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const userId = currentUser.id
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || 'Unknown'
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'Unknown'

    // 速率限制檢查
    const rateLimitKey = `${userId}_${ipAddress}`
    const now = Date.now()
    const rateLimit = rateLimitMap.get(rateLimitKey)
    
    if (rateLimit) {
      if (now - rateLimit.windowStart < connectionLimits.rateLimitWindow) {
        if (rateLimit.count >= connectionLimits.maxConnectionsPerMinute) {
          return new NextResponse(JSON.stringify({
            error: 'Too Many Requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((connectionLimits.rateLimitWindow - (now - rateLimit.windowStart)) / 1000)
          }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil((connectionLimits.rateLimitWindow - (now - rateLimit.windowStart)) / 1000))
            }
          })
        }
        rateLimit.count++
      } else {
        rateLimitMap.set(rateLimitKey, { count: 1, windowStart: now })
      }
    } else {
      rateLimitMap.set(rateLimitKey, { count: 1, windowStart: now })
    }

    // 檢查用戶連接數限制
    const userConnections = Array.from(activeConnections.values())
      .filter(conn => conn.userId === userId)
    
    if (userConnections.length >= connectionLimits.maxConnectionsPerUser) {
      // 關閉最舊的連接
      const oldestConnection = userConnections
        .sort((a, b) => a.connectionTime - b.connectionTime)[0]
      const oldestConnectionId = Array.from(activeConnections.entries())
        .find(([_, conn]) => conn === oldestConnection)?.[0]
      
      if (oldestConnectionId) {
        try {
          oldestConnection.controller.close()
        } catch (e) {
          console.warn('Failed to close old connection:', e)
        }
        activeConnections.delete(oldestConnectionId)
        connectionStats.activeConnections--
      }
    }

    // 檢查總連接數限制
    if (activeConnections.size >= connectionLimits.maxTotalConnections) {
      return new NextResponse(JSON.stringify({
        error: 'Server Overloaded',
        code: 'CONNECTION_LIMIT_EXCEEDED',
        message: 'Too many active connections. Please try again later.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const connectionId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 創建 ReadableStream 用於 SSE
    const stream = new ReadableStream({
      start(controller) {
        // 存儲連接
        activeConnections.set(connectionId, {
          controller,
          userId,
          lastPing: Date.now(),
          userAgent,
          ipAddress,
          connectionTime: Date.now()
        })

        // 更新連接統計
        connectionStats.totalConnections++
        connectionStats.activeConnections++
        const userConnCount = connectionStats.connectionsByUser.get(userId) || 0
        connectionStats.connectionsByUser.set(userId, userConnCount + 1)

        // 發送初始連接確認
        controller.enqueue(
          `data: ${JSON.stringify({
            type: 'connected',
            message: 'Connected to notification stream',
            connectionId,
            userId,
            serverTime: new Date().toISOString(),
            connectionStats: {
              activeConnections: connectionStats.activeConnections,
              userConnections: connectionStats.connectionsByUser.get(userId) || 1
            }
          })}\n\n`
        )

        // 發送心跳包
        const heartbeat = setInterval(() => {
          const connection = activeConnections.get(connectionId)
          if (connection) {
            try {
              connection.controller.enqueue(
                `data: ${JSON.stringify({
                  type: 'ping',
                  timestamp: new Date().toISOString(),
                  connectionId,
                  uptime: Date.now() - connection.connectionTime
                })}\n\n`
              )
              connection.lastPing = Date.now()
            } catch (error) {
              console.warn('Heartbeat failed for connection:', connectionId, error)
              clearInterval(heartbeat)
              cleanupConnection(connectionId)
            }
          } else {
            clearInterval(heartbeat)
          }
        }, 30000) // 每30秒發送一次心跳

        // 發送未讀通知統計
        sendNotificationStats(userId, controller)

        // 設置清理邏輯
        const cleanup = () => {
          clearInterval(heartbeat)
          cleanupConnection(connectionId)
        }

        // 監聽連接關閉
        request.signal.addEventListener('abort', cleanup)
      },

      cancel() {
        cleanupConnection(connectionId)
      }
    })

    // 設置 SSE 響應頭
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : process.env.NEXTAUTH_URL || 'https://landing-app-v2.zeabur.app',
        'Access-Control-Allow-Headers': 'Cache-Control, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'X-Accel-Buffering': 'no', // Nginx specific - disable buffering
        'X-Connection-ID': connectionId
      }
    })

  } catch (error) {
    console.error('SSE connection error:', error)
    connectionStats.errors++
    
    return new NextResponse(JSON.stringify({
      error: 'Internal Server Error',
      code: 'SSE_CONNECTION_ERROR',
      message: 'Failed to establish SSE connection'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

/**
 * POST /api/notifications/stream
 * 推送即時通知給特定用戶（內部 API）
 */
export async function POST(request: NextRequest) {
  try {
    // 這個端點主要用於內部服務調用
    // 可以添加內部 API 金鑰驗證

    const body = await request.json()
    const { userIds, notification, broadcast } = body

    if (broadcast) {
      // 廣播給所有連接的用戶
      broadcastToAllUsers(notification)
    } else if (userIds && Array.isArray(userIds)) {
      // 發送給特定用戶
      userIds.forEach(userId => {
        sendToUser(userId, notification)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications sent',
      activeConnections: activeConnections.size
    })

  } catch (error) {
    console.error('Push notification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to push notifications' },
      { status: 500 }
    )
  }
}

/**
 * 發送通知給特定用戶
 */
function sendToUser(userId: string, notification: any) {
  const userConnections = Array.from(activeConnections.entries()).filter(
    ([_, conn]) => conn.userId === userId
  )

  userConnections.forEach(([connectionId, connection]) => {
    try {
      connection.controller.enqueue(
        `data: ${JSON.stringify({
          type: 'notification',
          data: notification,
          timestamp: new Date().toISOString()
        })}\n\n`
      )
    } catch (error) {
      console.error('Failed to send to user:', error)
      activeConnections.delete(connectionId)
    }
  })
}

/**
 * 廣播通知給所有用戶
 */
function broadcastToAllUsers(notification: any) {
  activeConnections.forEach((connection, connectionId) => {
    try {
      connection.controller.enqueue(
        `data: ${JSON.stringify({
          type: 'broadcast',
          data: notification,
          timestamp: new Date().toISOString()
        })}\n\n`
      )
    } catch (error) {
      console.error('Failed to broadcast:', error)
      activeConnections.delete(connectionId)
    }
  })
}

/**
 * 發送通知統計
 */
async function sendNotificationStats(userId: string, controller: ReadableStreamDefaultController<any>) {
  try {
    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })

    controller.enqueue(
      `data: ${JSON.stringify({
        type: 'stats',
        data: { unreadCount },
        timestamp: new Date().toISOString()
      })}\n\n`
    )
  } catch (error) {
    console.error('Failed to send stats:', error)
  }
}

/**
 * 清理連接
 */
function cleanupConnection(connectionId: string) {
  const connection = activeConnections.get(connectionId)
  if (connection) {
    // 更新統計
    connectionStats.activeConnections--
    const userConnCount = connectionStats.connectionsByUser.get(connection.userId) || 1
    if (userConnCount <= 1) {
      connectionStats.connectionsByUser.delete(connection.userId)
    } else {
      connectionStats.connectionsByUser.set(connection.userId, userConnCount - 1)
    }
    
    activeConnections.delete(connectionId)
  }
}

/**
 * 清理非活躍連接
 */
function cleanupInactiveConnections() {
  const now = Date.now()
  const timeout = 5 * 60 * 1000 // 5分鐘
  let cleanedCount = 0

  activeConnections.forEach((connection, connectionId) => {
    if (now - connection.lastPing > timeout) {
      try {
        connection.controller.close()
      } catch (error) {
        // 連接可能已經關閉
      }
      cleanupConnection(connectionId)
      cleanedCount++
    }
  })

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} inactive SSE connections`)
  }
}

/**
 * 清理速率限制緩存
 */
function cleanupRateLimitCache() {
  const now = Date.now()
  let cleanedCount = 0

  rateLimitMap.forEach((rateLimit, key) => {
    if (now - rateLimit.windowStart > connectionLimits.rateLimitWindow * 2) {
      rateLimitMap.delete(key)
      cleanedCount++
    }
  })

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} rate limit entries`)
  }
}

/**
 * 獲取連接統計
 */
export function getConnectionStats() {
  return {
    ...connectionStats,
    activeConnectionDetails: Array.from(activeConnections.entries()).map(([id, conn]) => ({
      id,
      userId: conn.userId,
      uptime: Date.now() - conn.connectionTime,
      lastPing: conn.lastPing,
      userAgent: conn.userAgent,
      ipAddress: conn.ipAddress
    }))
  }
}

// 定期清理
setInterval(() => {
  cleanupInactiveConnections()
  cleanupRateLimitCache()
}, 60000) // 每分鐘清理一次

// 每5分鐘輸出連接統計
setInterval(() => {
  console.log('SSE Connection Stats:', {
    total: connectionStats.totalConnections,
    active: connectionStats.activeConnections,
    userConnections: connectionStats.connectionsByUser.size,
    errors: connectionStats.errors,
    reconnections: connectionStats.reconnections
  })
}, 5 * 60 * 1000)

/**
 * 導出工具函數供其他模組使用
 */
export { sendToUser, broadcastToAllUsers }