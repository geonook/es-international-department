import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'
import { EventFormData, EventStats } from '@/lib/types'

/**
 * Admin Events API - GET /api/admin/events
 * Administrator event API - Get event list
 * 
 * @description Get event list with filtering, search and pagination support
 * @features Pagination, filtering, search, statistics
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */
export async function GET(request: NextRequest) {
  try {
    // Verify administrator permissions
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const eventType = searchParams.get('eventType')
    const status = searchParams.get('status')
    const targetGrade = searchParams.get('targetGrade')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build filter conditions
    const where: any = {}

    if (eventType && eventType !== 'all') {
      where.eventType = eventType
    }

    if (status && status !== 'all') {
      where.status = status
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

    if (startDate || endDate) {
      where.startDate = {}
      if (startDate) {
        where.startDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.startDate.lte = new Date(endDate)
      }
    }

    const skip = (page - 1) * limit

    // PERFORMANCE OPTIMIZED: Batch all queries to prevent sequential execution
    const [events, totalCount, statusStats, typeStats, monthlyStats, registrationStats] = await Promise.all([
      // Get event list with optimized selection
      prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          eventType: true,
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          location: true,
          maxParticipants: true,
          registrationRequired: true,
          registrationDeadline: true,
          targetGrades: true,
          targetAudience: true,
          status: true,
          isFeatured: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true
            }
          }
        },
        orderBy: [
          { startDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      // Get total count
      prisma.event.count({ where }),
      // Get status counts in single aggregation query
      prisma.event.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      // Get type statistics
      prisma.event.groupBy({
        by: ['eventType'],
        _count: {
          eventType: true
        }
      }),
      // Get monthly statistics for current year
      prisma.event.groupBy({
        by: ['startDate'],
        where: {
          startDate: {
            gte: new Date(`${new Date().getFullYear()}-01-01`),
            lt: new Date(`${new Date().getFullYear() + 1}-01-01`)
          }
        },
        _count: {
          startDate: true
        }
      }),
      // Get registration statistics
      prisma.eventRegistration.aggregate({
        _count: {
          id: true
        },
        _avg: {
          eventId: true
        }
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Process status statistics from grouped results
    const processedStatusStats = {
      total: totalCount,
      published: 0,
      draft: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    }
    
    statusStats.forEach(stat => {
      const key = stat.status as keyof typeof processedStatusStats
      if (key in processedStatusStats) {
        processedStatusStats[key] = stat._count.status
      }
    })

    // Process type statistics
    const byType: { [key: string]: number } = {}
    typeStats.forEach(stat => {
      byType[stat.eventType] = stat._count.eventType
    })

    // Process monthly statistics
    const byMonth: { [key: string]: number } = {}
    monthlyStats.forEach(stat => {
      const month = new Date(stat.startDate).toLocaleDateString('zh-TW', { month: 'long' })
      byMonth[month] = (byMonth[month] || 0) + stat._count.startDate
    })

    const stats: EventStats = {
      ...processedStatusStats,
      byType,
      byMonth,
      totalRegistrations: registrationStats._count.id || 0,
      averageParticipants: Math.round(registrationStats._avg.eventId || 0)
    }


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
      status: status || 'all',
      targetGrade: targetGrade || 'all',
      search: search || '',
      dateRange: startDate || endDate ? { start: startDate, end: endDate } : undefined
    }

    return NextResponse.json({
      success: true,
      data: events,
      pagination,
      filters,
      stats
    })

  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get event list' },
      { status: 500 }
    )
  }
}

/**
 * Admin Events API - POST /api/admin/events
 * Administrator event API - Create new event
 */
export async function POST(request: NextRequest) {
  try {
    // Verify administrator permissions
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

    // Create event data
    const eventData: any = {
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
      targetAudience: data.targetAudience || [],
      status: data.status,
      createdBy: currentUser.id
    }

    // Create event
    const event = await prisma.event.create({
      data: eventData,
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
      message: 'Event created successfully',
      data: event
    })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create event' },
      { status: 500 }
    )
  }
}