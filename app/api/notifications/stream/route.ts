import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Real-time Notifications Stream API - /api/notifications/stream
 * 即時通知串流 API
 * 
 * @description 使用 Server-Sent Events (SSE) 提供即時通知推送
 * @features 即時通知推送、長連接、自動重連
 * @author Claude Code | Generated for ES International Department
 */

// 存儲活躍的 SSE 連接
const activeConnections = new Map<string, {
  controller: ReadableStreamDefaultController<any>
  userId: string
  lastPing: number
}>()

/**
 * GET /api/notifications/stream
 * 建立 SSE 連接用於即時通知推送
 */
export async function GET(request: NextRequest) {
  try {
    // 驗證用戶身份
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userId = currentUser.id
    const connectionId = `${userId}_${Date.now()}`

    // 創建 ReadableStream 用於 SSE
    const stream = new ReadableStream({
      start(controller) {
        // 存儲連接
        activeConnections.set(connectionId, {
          controller,
          userId,
          lastPing: Date.now()
        })

        // 發送初始連接確認
        controller.enqueue(
          `data: ${JSON.stringify({
            type: 'connected',
            message: 'Connected to notification stream',
            timestamp: new Date().toISOString()
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
                  timestamp: new Date().toISOString()
                })}\n\n`
              )
              connection.lastPing = Date.now()
            } catch (error) {
              // 連接已關閉
              clearInterval(heartbeat)
              activeConnections.delete(connectionId)
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
          activeConnections.delete(connectionId)
        }

        // 監聽連接關閉
        request.signal.addEventListener('abort', cleanup)
      },

      cancel() {
        activeConnections.delete(connectionId)
      }
    })

    // 設置 SSE 響應頭
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })

  } catch (error) {
    console.error('SSE connection error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
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
 * 清理非活躍連接
 */
function cleanupInactiveConnections() {
  const now = Date.now()
  const timeout = 5 * 60 * 1000 // 5分鐘

  activeConnections.forEach((connection, connectionId) => {
    if (now - connection.lastPing > timeout) {
      try {
        connection.controller.close()
      } catch (error) {
        // 連接可能已經關閉
      }
      activeConnections.delete(connectionId)
    }
  })
}

// 定期清理非活躍連接
setInterval(cleanupInactiveConnections, 60000) // 每分鐘清理一次

/**
 * 導出工具函數供其他模組使用
 */
export { sendToUser, broadcastToAllUsers }