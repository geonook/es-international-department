import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

/**
 * Real-time Notifications Stream API - /api/notifications/stream
 * Real-time Notifications Stream API
 * 
 * @description Provides real-time notification push using Server-Sent Events (SSE)
 * @features Real-time notification push, persistent connection, auto-reconnect
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

// Store active SSE connections
const activeConnections = new Map<string, {
  controller: ReadableStreamDefaultController<any>
  userId: string
  lastPing: number
  userAgent?: string
  ipAddress?: string
  connectionTime: number
}>()

// Connection limits and monitoring
const connectionLimits = {
  maxConnectionsPerUser: 3,
  maxTotalConnections: 1000,
  rateLimitWindow: 60 * 1000, // 1 minute
  maxConnectionsPerMinute: 10
}

// Rate limit tracking
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

// Connection statistics
const connectionStats = {
  totalConnections: 0,
  activeConnections: 0,
  connectionsByUser: new Map<string, number>(),
  reconnections: 0,
  errors: 0
}

/**
 * GET /api/notifications/stream
 * Establish SSE connection for real-time notification push
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user identity - more secure header validation
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

    // Rate limit check
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

    // Check user connection count limit
    const userConnections = Array.from(activeConnections.values())
      .filter(conn => conn.userId === userId)
    
    if (userConnections.length >= connectionLimits.maxConnectionsPerUser) {
      // Close the oldest connection
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

    // Check total connection count limit
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

    // Create ReadableStream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Store connection
        activeConnections.set(connectionId, {
          controller,
          userId,
          lastPing: Date.now(),
          userAgent,
          ipAddress,
          connectionTime: Date.now()
        })

        // Update connection statistics
        connectionStats.totalConnections++
        connectionStats.activeConnections++
        const userConnCount = connectionStats.connectionsByUser.get(userId) || 0
        connectionStats.connectionsByUser.set(userId, userConnCount + 1)

        // Send initial connection confirmation
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

        // Send heartbeat
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
        }, 30000) // Send heartbeat every 30 seconds

        // Send unread notification statistics
        sendNotificationStats(userId, controller)

        // Set cleanup logic
        const cleanup = () => {
          clearInterval(heartbeat)
          cleanupConnection(connectionId)
        }

        // Listen for connection close
        request.signal.addEventListener('abort', cleanup)
      },

      cancel() {
        cleanupConnection(connectionId)
      }
    })

    // Set SSE response headers
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
 * Push real-time notifications to specific users (internal API)
 */
export async function POST(request: NextRequest) {
  try {
    // This endpoint is mainly for internal service calls
    // Internal API key authentication can be added

    const body = await request.json()
    const { userIds, notification, broadcast } = body

    if (broadcast) {
      // Broadcast to all connected users
      broadcastToAllUsers(notification)
    } else if (userIds && Array.isArray(userIds)) {
      // Send to specific users
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
 * Send notification to specific user
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
 * Broadcast notification to all users
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
 * Send notification statistics
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
 * Cleanup connection
 */
function cleanupConnection(connectionId: string) {
  const connection = activeConnections.get(connectionId)
  if (connection) {
    // Update statistics
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
 * Cleanup inactive connections
 */
function cleanupInactiveConnections() {
  const now = Date.now()
  const timeout = 5 * 60 * 1000 // 5 minutes
  let cleanedCount = 0

  activeConnections.forEach((connection, connectionId) => {
    if (now - connection.lastPing > timeout) {
      try {
        connection.controller.close()
      } catch (error) {
        // Connection may already be closed
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
 * Cleanup rate limit cache
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
 * Get connection statistics
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

// Periodic cleanup
setInterval(() => {
  cleanupInactiveConnections()
  cleanupRateLimitCache()
}, 60000) // Cleanup every minute

// Output connection statistics every 5 minutes
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
 * Export utility functions for other modules to use
 */
export { sendToUser, broadcastToAllUsers }