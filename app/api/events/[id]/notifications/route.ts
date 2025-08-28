import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS, isAdmin } from '@/lib/auth'
import { EventNotificationType, NotificationRecipientType } from '@/lib/types'

/**
 * Event Notifications API - /api/events/[id]/notifications
 * 
 * @description Handle event notification related operations
 * @features Send notifications, query notification history, schedule notifications
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/events/[id]/notifications
 * Get event notification list (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin permissions
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    if (!isAdmin(currentUser)) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.ACCESS_DENIED,
        message: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event ID' },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event does not exist' },
        { status: 404 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Build filter conditions
    const where: any = { eventId }

    if (status && status !== 'all') {
      where.status = status
    }

    if (type && type !== 'all') {
      where.type = type
    }

    // Calculate total count and pagination
    const totalCount = await prisma.eventNotification.count({ where })
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // Get notification list
    const notifications = await prisma.eventNotification.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // Build pagination information
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
      event
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
 * POST /api/events/[id]/notifications
 * Create and send event notification (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin permissions
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    if (!isAdmin(currentUser)) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.ACCESS_DENIED,
        message: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event ID' },
        { status: 400 }
      )
    }

    // Parse request data
    const data = await request.json()
    const {
      type,
      recipientType,
      title,
      message,
      scheduledFor,
      targetGrades,
      specificUserIds
    } = data

    // Validate required fields
    if (!type || !recipientType || !title || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          where: {
            status: 'confirmed'
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event does not exist' },
        { status: 404 }
      )
    }

    // Calculate number of recipients
    let recipientCount = 0
    let recipients: string[] = []

    switch (recipientType) {
      case 'all_registered':
        recipients = event.registrations.map(reg => reg.userId)
        recipientCount = recipients.length
        break
      
      case 'specific_users':
        if (specificUserIds && Array.isArray(specificUserIds)) {
          recipients = specificUserIds
          recipientCount = specificUserIds.length
        }
        break
      
      case 'target_audience':
        // Send based on event target audience
        if (event.targetGrades && Array.isArray(event.targetGrades)) {
          const users = await prisma.user.findMany({
            where: {
              isActive: true,
              // Filter based on actual user-grade association logic
              // Temporarily send to all active users
            },
            select: { id: true }
          })
          recipients = users.map(user => user.id)
          recipientCount = recipients.length
        }
        break
      
      case 'grade_level':
        if (targetGrades && Array.isArray(targetGrades)) {
          // Send based on specified grades
          const users = await prisma.user.findMany({
            where: {
              isActive: true,
              // Filter based on actual user-grade association logic
            },
            select: { id: true }
          })
          recipients = users.map(user => user.id)
          recipientCount = recipients.length
        }
        break
    }

    // Create notification record
    const notification = await prisma.eventNotification.create({
      data: {
        eventId,
        type: type as EventNotificationType,
        recipientType: recipientType as NotificationRecipientType,
        title,
        message,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        recipientCount,
        createdBy: currentUser.id
      }
    })

    // If immediate send, handle notification sending
    if (!scheduledFor) {
      try {
        // Create personal notification record for each recipient
        const personalNotifications = recipients.map(userId => ({
          recipientId: userId,
          title,
          message,
          type: type === 'registration_confirmed' ? 'event' : 'system',
          relatedId: eventId,
          relatedType: 'event'
        }))

        if (personalNotifications.length > 0) {
          await prisma.notification.createMany({
            data: personalNotifications
          })

          // Update notification status to sent
          await prisma.eventNotification.update({
            where: { id: notification.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
              deliveredCount: personalNotifications.length
            }
          })
        }

        return NextResponse.json({
          success: true,
          message: `Notification sent to ${personalNotifications.length} users`,
          data: {
            ...notification,
            status: 'sent',
            sentAt: new Date(),
            deliveredCount: personalNotifications.length
          }
        })

      } catch (sendError) {
        console.error('Send notification error:', sendError)
        
        // Update notification status to failed
        await prisma.eventNotification.update({
          where: { id: notification.id },
          data: {
            status: 'failed',
            errorMessage: 'Failed to send notifications'
          }
        })

        return NextResponse.json({
          success: false,
          message: 'Notification created successfully but sending failed',
          data: notification
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: scheduledFor ? 'Notification scheduled for sending' : 'Notification created successfully',
      data: notification
    })

  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create notification' },
      { status: 500 }
    )
  }
}