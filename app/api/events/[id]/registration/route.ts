import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'

/**
 * Event Registration API - /api/events/[id]/registration
 * Event registration API
 * 
 * @description Handle event registration related operations
 * @features Add registration, cancel registration, check registration status, waiting list management
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/events/[id]/registration
 * Get user's registration status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user identity
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

    // Check if event exists and is published
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        registrationRequired: true,
        registrationDeadline: true,
        maxParticipants: true,
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
        { success: false, message: 'Event does not exist or is not published' },
        { status: 404 }
      )
    }

    if (!event.registrationRequired) {
      return NextResponse.json(
        { success: false, message: 'This event does not require registration' },
        { status: 400 }
      )
    }

    // Query user registration status
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: currentUser.id
        }
      },
      select: {
        id: true,
        status: true,
        participantName: true,
        participantEmail: true,
        participantPhone: true,
        grade: true,
        specialRequests: true,
        registeredAt: true,
        checkedIn: true,
        checkedInAt: true
      }
    })

    // Calculate registration status
    const registrationCount = event._count.registrations
    const spotsAvailable = event.maxParticipants ? event.maxParticipants - registrationCount : null
    const isRegistrationOpen = !event.registrationDeadline || new Date(event.registrationDeadline) > new Date()
    const canRegister = !registration && isRegistrationOpen && 
      (!event.maxParticipants || registrationCount < event.maxParticipants)
    const canCancelRegistration = registration && 
      registration.status !== 'cancelled' && isRegistrationOpen

    return NextResponse.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          registrationRequired: event.registrationRequired,
          registrationDeadline: event.registrationDeadline,
          maxParticipants: event.maxParticipants,
          registrationCount,
          spotsAvailable,
          isRegistrationOpen
        },
        registration,
        canRegister,
        canCancelRegistration
      }
    })

  } catch (error) {
    console.error('Get registration status error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get registration status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events/[id]/registration
 * Add event registration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user identity
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

    // Parse request data
    const data = await request.json()
    const {
      participantName,
      participantEmail,
      participantPhone,
      grade,
      specialRequests
    } = data

    // Check if event exists and requires registration
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId,
        status: 'published',
        registrationRequired: true
      },
      select: {
        id: true,
        title: true,
        registrationDeadline: true,
        maxParticipants: true,
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
        { success: false, message: 'Event does not exist, is not published, or does not require registration' },
        { status: 404 }
      )
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date(event.registrationDeadline) <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'Registration deadline has passed' },
        { status: 400 }
      )
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: currentUser.id
        }
      }
    })

    if (existingRegistration && existingRegistration.status !== 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'You have already registered for this event' },
        { status: 400 }
      )
    }

    // Check registration limit
    const registrationCount = event._count.registrations
    let registrationStatus = 'confirmed'

    if (event.maxParticipants && registrationCount >= event.maxParticipants) {
      registrationStatus = 'waiting_list'
    }

    // Create or update registration record
    const registrationData = {
      eventId,
      userId: currentUser.id,
      participantName: participantName || currentUser.displayName,
      participantEmail: participantEmail || currentUser.email,
      participantPhone,
      grade,
      specialRequests,
      status: registrationStatus
    }

    let registration
    if (existingRegistration) {
      // Re-enable cancelled registration
      registration = await prisma.eventRegistration.update({
        where: { id: existingRegistration.id },
        data: {
          ...registrationData,
          registeredAt: new Date()
        }
      })
    } else {
      // Create new registration
      registration = await prisma.eventRegistration.create({
        data: registrationData
      })
    }

    // Create registration confirmation notification
    await prisma.eventNotification.create({
      data: {
        eventId,
        type: 'registration_confirmed',
        recipientType: 'specific_users',
        title: `Registration Confirmed: ${event.title}`,
        message: registrationStatus === 'confirmed' 
          ? `You have successfully registered for ${event.title}. We look forward to your participation!`
          : `You have been added to the waiting list for ${event.title}. We will notify you immediately if a spot becomes available.`,
        recipientCount: 1,
        createdBy: currentUser.id
      }
    })

    return NextResponse.json({
      success: true,
      message: registrationStatus === 'confirmed' 
        ? 'Registration successful!' 
        : 'Added to waiting list',
      data: {
        id: registration.id,
        status: registration.status,
        registeredAt: registration.registeredAt,
        participantName: registration.participantName,
        grade: registration.grade
      }
    })

  } catch (error) {
    console.error('Create registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/[id]/registration
 * Cancel event registration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user identity
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

    // Check if event exists
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        registrationDeadline: true
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event does not exist or is not published' },
        { status: 404 }
      )
    }

    // Check registration deadline (cancellation also usually needs to be within deadline)
    if (event.registrationDeadline && new Date(event.registrationDeadline) <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'Registration cancellation deadline has passed' },
        { status: 400 }
      )
    }

    // Find user's registration record
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: currentUser.id
        }
      }
    })

    if (!registration || registration.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'You have not registered for this event' },
        { status: 400 }
      )
    }

    // Update registration status to cancelled
    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { 
        status: 'cancelled',
        updatedAt: new Date()
      }
    })

    // If originally confirmed status, check waiting list
    if (registration.status === 'confirmed') {
      const waitingListRegistration = await prisma.eventRegistration.findFirst({
        where: {
          eventId,
          status: 'waiting_list'
        },
        orderBy: {
          registeredAt: 'asc'
        }
      })

      // Move first person from waiting list to confirmed status
      if (waitingListRegistration) {
        await prisma.eventRegistration.update({
          where: { id: waitingListRegistration.id },
          data: { status: 'confirmed' }
        })

        // Send waiting list promotion notification
        await prisma.eventNotification.create({
          data: {
            eventId,
            type: 'registration_confirmed',
            recipientType: 'specific_users',
            title: `Waiting List Promotion: ${event.title}`,
            message: `Good news! You have been moved from the waiting list to confirmed registration for ${event.title}. We look forward to your participation!`,
            recipientCount: 1,
            createdBy: currentUser.id
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration cancelled'
    })

  } catch (error) {
    console.error('Cancel registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Registration cancellation failed' },
      { status: 500 }
    )
  }
}