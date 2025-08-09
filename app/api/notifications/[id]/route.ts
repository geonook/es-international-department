import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'

/**
 * Individual Notification API - /api/notifications/[id]
 * Individual Notification API
 * 
 * @description Handle single notification retrieval, mark as read, delete operations
 * @features Notification details, mark as read, delete notification
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/notifications/[id]
 * Get single notification details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: 'Unauthorized access' }, 
        { status: 401 }
      )
    }

    const notificationId = parseInt(params.id)
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    // Get notification details
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: currentUser.id
      },
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
      }
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification does not exist' },
        { status: 404 }
      )
    }

    // Check if expired
    const isExpired = notification.expiresAt && notification.expiresAt < new Date()
    if (isExpired) {
      return NextResponse.json(
        { success: false, message: 'Notification has expired' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notification
    })

  } catch (error) {
    console.error('Get notification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get notification' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/[id]
 * Update notification status (mark as read/unread)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: 'Unauthorized access' }, 
        { status: 401 }
      )
    }

    const notificationId = parseInt(params.id)
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    // Parse request data
    const body = await request.json()
    const { action } = body

    if (!action || !['mark_read', 'mark_unread'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid operation' },
        { status: 400 }
      )
    }

    // Check if notification exists and belongs to current user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: currentUser.id
      }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, message: 'Notification does not exist' },
        { status: 404 }
      )
    }

    // Update notification status
    const updateData: any = {}
    
    if (action === 'mark_read') {
      updateData.isRead = true
      updateData.readAt = new Date()
    } else if (action === 'mark_unread') {
      updateData.isRead = false
      updateData.readAt = null
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: updateData,
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
      }
    })

    return NextResponse.json({
      success: true,
      message: action === 'mark_read' ? 'Marked as read' : 'Marked as unread',
      data: updatedNotification
    })

  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: 'Unauthorized access' }, 
        { status: 401 }
      )
    }

    const notificationId = parseInt(params.id)
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    // Check if notification exists and belongs to current user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: currentUser.id
      }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, message: 'Notification does not exist' },
        { status: 404 }
      )
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted'
    })

  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}