import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS, isAdmin } from '@/lib/auth'
import NotificationService from '@/lib/notificationService'
import { BulkNotificationOperation } from '@/lib/types'

/**
 * Bulk Notification Operations API - /api/notifications/mark-read
 * Bulk Notification Operations API
 * 
 * @description Handles bulk notification operations such as mark all read, bulk delete, etc.
 * @features Mark all read, bulk operations, cleanup expired notifications
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * POST /api/notifications/mark-read
 * Bulk mark notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user identity
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: 'Unauthorized access' }, 
        { status: 401 }
      )
    }

    const userId = currentUser.id
    const body = await request.json()
    const { action, notificationIds, markAll } = body

    if (markAll) {
      // Mark all unread notifications as read
      const result = await prisma.notification.updateMany({
        where: {
          recipientId: userId,
          isRead: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: `Marked ${result.count} notifications as read`,
        data: { affectedCount: result.count }
      })
    }

    // Validate bulk operation data
    if (!action || !notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      )
    }

    if (notificationIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No notifications selected' },
        { status: 400 }
      )
    }

    if (notificationIds.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Bulk operation limited to 100 notifications' },
        { status: 400 }
      )
    }

    // Execute bulk operation
    const operation: BulkNotificationOperation = {
      action,
      notificationIds
    }

    const result = await NotificationService.bulkOperation(userId, operation)

    if (result.success) {
      let message = ''
      switch (action) {
        case 'mark_read':
          message = `Marked ${result.affectedCount} notifications as read`
          break
        case 'mark_unread':
          message = `Marked ${result.affectedCount} notifications as unread`
          break
        case 'archive':
          message = `Archived ${result.affectedCount} notifications`
          break
        case 'delete':
          message = `Deleted ${result.affectedCount} notifications`
          break
        default:
          message = `Operation completed, affected ${result.affectedCount} notifications`
      }

      return NextResponse.json({
        success: true,
        message,
        data: result
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Bulk operation failed',
        data: result
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Bulk notification operation error:', error)
    return NextResponse.json(
      { success: false, message: 'Bulk operation failed' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/mark-read
 * Clean up expired notifications (admin function)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify user identity
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: 'Unauthorized access' }, 
        { status: 401 }
      )
    }

    // Check admin permissions
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.ACCESS_DENIED, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Clean up expired notifications
    const cleanedCount = await NotificationService.cleanupExpiredNotifications()

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired notifications`,
      data: { cleanedCount }
    })

  } catch (error) {
    console.error('Cleanup expired notifications error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to clean up expired notifications' },
      { status: 500 }
    )
  }
}