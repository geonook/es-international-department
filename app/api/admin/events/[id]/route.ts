import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS, isAdmin } from '@/lib/auth'
import { EventFormData } from '@/lib/types'

export const dynamic = 'force-dynamic'

/**
 * Admin Event API - GET /api/admin/events/[id]
 * Admin Event API - Get single event details
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

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: '活動不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: event
    })

  } catch (error) {
    console.error('Get event error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get event' },
      { status: 500 }
    )
  }
}

/**
 * Admin Event API - PUT /api/admin/events/[id]
 * Admin Event API - Update event
 */
export async function PUT(
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
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, message: '活動不存在' },
        { status: 404 }
      )
    }

    // Parse request data
    const data: EventFormData = await request.json()

    // Validate required fields
    if (!data.title || !data.eventType || !data.startDate || !data.status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate date logic
    if (data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      return NextResponse.json(
        { success: false, message: 'End date cannot be earlier than start date' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      title: data.title,
      description: data.description,
      eventType: data.eventType,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      startTime: data.startTime ? new Date(`1970-01-01T${data.startTime}:00`) : null,
      endTime: data.endTime ? new Date(`1970-01-01T${data.endTime}:00`) : null,
      location: data.location,
      maxParticipants: data.maxParticipants,
      registrationRequired: data.registrationRequired,
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
      targetGrades: data.targetGrades || [],
      status: data.status,
      updatedAt: new Date()
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    })

  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update event' },
      { status: 500 }
    )
  }
}

/**
 * Admin Event API - DELETE /api/admin/events/[id]
 * Admin Event API - Delete event
 */
export async function DELETE(
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
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, message: '活動不存在' },
        { status: 404 }
      )
    }

    // Check for related registration records (if registration system exists)
    // Additional check logic can be added here, for example:
    // const registrations = await prisma.eventRegistration.count({
    //   where: { eventId }
    // })
    // if (registrations > 0) {
    //   return NextResponse.json(
    //     { success: false, message: 'Cannot delete event with existing registrations' },
    //     { status: 400 }
    //   )
    // }

    // Delete event
    await prisma.event.delete({
      where: { id: eventId }
    })

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete event' },
      { status: 500 }
    )
  }
}