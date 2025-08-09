import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'

/**
 * Public Event API - GET /api/events/[id]
 * Public Event API - Get single event details
 * 
 * @description Get detailed information for a single published event
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event ID' },
        { status: 400 }
      )
    }

    // Get event details - only show published events
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId,
        status: 'published' // Only published events can be publicly viewed
      },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        },
        registrations: {
          where: {
            status: 'confirmed'
          },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        attachments: {
          where: {
            relatedType: 'event'
          },
          select: {
            id: true,
            originalFilename: true,
            filePath: true,
            mimeType: true,
            fileSize: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            registrations: {
              where: {
                status: 'confirmed'
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event does not exist or not yet published' },
        { status: 404 }
      )
    }

    // Check if current user is registered
    const userRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: currentUser.id
        }
      }
    })

    // Process event data
    const processedEvent = {
      ...event,
      registrationCount: event._count.registrations,
      isRegistrationOpen: event.registrationRequired && 
        (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date()) &&
        (!event.maxParticipants || event._count.registrations < event.maxParticipants) &&
        event.status === 'published',
      userRegistration: userRegistration ? {
        id: userRegistration.id,
        status: userRegistration.status,
        registeredAt: userRegistration.registeredAt,
        participantName: userRegistration.participantName,
        grade: userRegistration.grade
      } : null,
      isUserRegistered: !!userRegistration && userRegistration.status === 'confirmed',
      isUserOnWaitingList: !!userRegistration && userRegistration.status === 'waiting_list',
      spotsRemaining: event.maxParticipants ? 
        event.maxParticipants - event._count.registrations : null,
      canRegister: event.registrationRequired && 
        !userRegistration && 
        (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date()) &&
        (!event.maxParticipants || event._count.registrations < event.maxParticipants),
      canCancelRegistration: !!userRegistration && 
        userRegistration.status !== 'cancelled' &&
        (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date()),
      // Remove sensitive information and internal fields
      _count: undefined,
      registrations: event.registrations.map(reg => ({
        id: reg.id,
        participantName: reg.participantName || reg.user.displayName || 
          `${reg.user.firstName} ${reg.user.lastName}`.trim(),
        grade: reg.grade,
        registeredAt: reg.registeredAt
      }))
    }

    return NextResponse.json({
      success: true,
      data: processedEvent
    })

  } catch (error) {
    console.error('Get event error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get event' },
      { status: 500 }
    )
  }
}