import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAuth, getSearchParams, parsePaginationParams, createApiErrorResponse, createApiSuccessResponse } from '@/lib/auth-utils'

/**
 * Public Events API - GET /api/events
 * Public Events API - Get published events list
 * 
 * @description Get list of published events with filtering, search and pagination
 * @features Pagination, filtering, search, published events only
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication (login required to view events)
    const authResult = await requireApiAuth(request)
    if (!authResult.success) {
      return authResult.response!
    }
    const currentUser = authResult.user!

    // Parse query parameters
    const searchParams = getSearchParams(request)
    const { page, limit } = parsePaginationParams(searchParams)
    const eventType = searchParams.get('eventType')
    const targetGrade = searchParams.get('targetGrade')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const upcoming = searchParams.get('upcoming') === 'true'
    const featured = searchParams.get('featured') === 'true'

    // Build filter conditions - only show published events
    const where: any = {
      status: 'published'
    }

    if (eventType && eventType !== 'all') {
      where.eventType = eventType
    }

    if (targetGrade && targetGrade !== 'all') {
      where.targetGrades = {
        array_contains: [targetGrade]
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Date range filtering
    if (startDate || endDate || upcoming) {
      where.startDate = {}
      
      if (upcoming) {
        // Only show future events
        where.startDate.gte = new Date()
      } else {
        if (startDate) {
          where.startDate.gte = new Date(startDate)
        }
        if (endDate) {
          where.startDate.lte = new Date(endDate)
        }
      }
    }

    // Featured events filtering
    if (featured) {
      where.isFeatured = true
    }

    // Calculate total count
    const totalCount = await prisma.event.count({ where })
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // Get events list
    const events = await prisma.event.findMany({
      where,
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
          select: {
            id: true,
            status: true
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
            fileSize: true
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
      },
      orderBy: [
        { startDate: upcoming ? 'asc' : 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // Process event data, add registration statistics
    const processedEvents = events.map(event => ({
      ...event,
      registrationCount: event._count.registrations,
      isRegistrationOpen: event.registrationRequired && 
        (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date()) &&
        (!event.maxParticipants || event._count.registrations < event.maxParticipants),
      isUserRegistered: event.registrations.some(reg => 
        reg.status === 'confirmed' && 
        event.registrations.find(r => r.status === 'confirmed')
      ),
      spotsRemaining: event.maxParticipants ? 
        event.maxParticipants - event._count.registrations : null,
      // Remove internal count fields
      _count: undefined,
      registrations: undefined
    }))

    // Build pagination info
    const pagination = {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }

    // Build filter info
    const filters = {
      eventType: eventType || 'all',
      targetGrade: targetGrade || 'all',
      search: search || '',
      dateRange: startDate || endDate ? { start: startDate, end: endDate } : undefined,
      upcoming,
      featured
    }

    return createApiSuccessResponse({
      events: processedEvents,
      pagination,
      filters
    })

  } catch (error) {
    console.error('Get public events error:', error)
    return createApiErrorResponse('Failed to get events list', 500)
  }
}