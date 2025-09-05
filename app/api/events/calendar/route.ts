import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAuth, getSearchParams, parsePaginationParams, createApiErrorResponse, createApiSuccessResponse } from '@/lib/auth-utils'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

/**
 * Events Calendar API - GET /api/events/calendar
 * Events Calendar API - Get calendar formatted event data
 * 
 * @description Provides event data format suitable for calendar components
 * @features Monthly view, yearly view, event summary, quick filtering
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const authResult = await requireApiAuth(request)
    if (!authResult.success) {
      return authResult.response!
    }
    const currentUser = authResult.user!

    // Parse query parameters
    const searchParams = getSearchParams(request)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null
    const eventType = searchParams.get('eventType')
    const targetGrade = searchParams.get('targetGrade')
    const userOnly = searchParams.get('userOnly') === 'true' // Show only user registered events

    // Build date range
    let startDate: Date
    let endDate: Date

    if (month !== null) {
      // Monthly view
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else {
      // Yearly view
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    }

    // Build filter conditions
    const where: any = {
      status: 'published',
      startDate: {
        gte: startDate,
        lte: endDate
      }
    }

    if (eventType && eventType !== 'all') {
      where.eventType = eventType
    }

    if (targetGrade && targetGrade !== 'all') {
      where.targetGrades = {
        array_contains: [targetGrade]
      }
    }

    // If only user registered events
    if (userOnly) {
      where.registrations = {
        some: {
          userId: currentUser.id,
          status: {
            in: ['confirmed', 'waiting_list']
          }
        }
      }
    }

    // Get event data
    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true
          }
        },
        registrations: userOnly ? {
          where: {
            userId: currentUser.id
          },
          select: {
            id: true,
            status: true,
            participantName: true,
            grade: true
          }
        } : {
          where: {
            status: 'confirmed'
          },
          select: {
            id: true
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
      orderBy: {
        startDate: 'asc'
      }
    })

    // Convert to calendar format
    const calendarEvents = events.map(event => {
      const userRegistration = userOnly ? event.registrations[0] : null
      
      return {
        id: event.id,
        title: event.title,
        start: event.startDate,
        end: event.endDate || event.startDate,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        eventType: event.eventType,
        targetGrades: event.targetGrades,
        description: event.description,
        creator: event.creator ? 
          event.creator.displayName || 
          `${event.creator.firstName} ${event.creator.lastName}`.trim() : 
          null,
        registrationRequired: event.registrationRequired,
        registrationDeadline: event.registrationDeadline,
        maxParticipants: event.maxParticipants,
        registrationCount: event._count.registrations,
        spotsRemaining: event.maxParticipants ? 
          event.maxParticipants - event._count.registrations : null,
        userRegistration: userRegistration ? {
          id: userRegistration.id,
          status: userRegistration.status,
          participantName: userRegistration.participantName,
          grade: userRegistration.grade
        } : null,
        isUserRegistered: !!userRegistration,
        className: getEventClassName(event.eventType, userRegistration?.status),
        color: getEventColor(event.eventType),
        allDay: !event.startTime && !event.endTime,
        url: `/events/${event.id}` // Frontend route
      }
    })

    // Group by month (if yearly view)
    const groupedByMonth = month === null ? groupEventsByMonth(calendarEvents) : null

    // Calculate statistics
    const stats = {
      totalEvents: events.length,
      byType: {} as Record<string, number>,
      byMonth: {} as Record<string, number>,
      userRegistrations: userOnly ? events.filter(e => e.registrations.length > 0).length : 
        await prisma.eventRegistration.count({
          where: {
            userId: currentUser.id,
            status: {
              in: ['confirmed', 'waiting_list']
            },
            event: {
              startDate: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        })
    }

    // Count events by type
    for (const event of events) {
      stats.byType[event.eventType] = (stats.byType[event.eventType] || 0) + 1
    }

    // Count events by month (yearly view)
    if (month === null) {
      for (const event of events) {
        const monthKey = new Date(event.startDate).toLocaleDateString('zh-TW', { 
          year: 'numeric', 
          month: 'long' 
        })
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1
      }
    }

    return createApiSuccessResponse({
      events: calendarEvents,
      groupedByMonth,
      period: {
        year,
        month,
        startDate,
        endDate
      },
      stats
    })

  } catch (error) {
    console.error('Get calendar events error:', error)
    return createApiErrorResponse('Failed to get calendar data', 500)
  }
}

/**
 * Generate CSS class name based on event type and user registration status
 */
function getEventClassName(eventType: string, userRegistrationStatus?: string): string {
  const baseClass = `event-${eventType.toLowerCase().replace(/\s+/g, '-')}`
  
  if (userRegistrationStatus === 'confirmed') {
    return `${baseClass} user-registered`
  } else if (userRegistrationStatus === 'waiting_list') {
    return `${baseClass} user-waiting`
  }
  
  return baseClass
}

/**
 * Get color based on event type
 */
function getEventColor(eventType: string): string {
  const colorMap: Record<string, string> = {
    'academic': '#3B82F6', // Academic activities - Blue
    'sports': '#10B981', // Sports activities - Green
    'cultural': '#8B5CF6', // Cultural activities - Purple
    'parent_meeting': '#F59E0B', // Parent meetings - Orange
    'field_trip': '#EF4444', // Field trips - Red
    'workshop': '#6366F1', // Workshops - Indigo
    'celebration': '#EC4899', // Celebrations - Pink
    'meeting': '#6B7280', // Meetings - Gray
    'conference': '#059669', // Conferences - Green
    'other': '#9CA3AF' // Other - Light gray
  }
  
  return colorMap[eventType] || colorMap['other']
}

/**
 * Group events by month
 */
function groupEventsByMonth(events: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {}
  
  for (const event of events) {
    const monthKey = new Date(event.start).toLocaleDateString('zh-TW', { 
      year: 'numeric', 
      month: 'numeric' 
    })
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = []
    }
    
    grouped[monthKey].push(event)
  }
  
  return grouped
}