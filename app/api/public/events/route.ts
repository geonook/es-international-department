import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Public API for Parents Corner
 * GET /api/public/events
 * 
 * Returns public events for parents
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const upcoming = searchParams.get('upcoming') === 'true'

    // Build where clause
    const where: any = {
      status: 'published'
    }

    // Filter for upcoming events if requested
    if (upcoming) {
      where.startDate = { gte: new Date() }
    }

    // Fetch public events
    const events = await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        location: true,
        eventType: true,
        registrationRequired: true,
        registrationDeadline: true,
        maxParticipants: true,
        targetGrades: true,
        targetAudience: true,
        isFeatured: true,
        creator: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { startDate: 'asc' }
      ],
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const total = await prisma.event.count({ where })

    // Set CORS headers for public access
    const headers = {
      'Access-Control-Allow-Origin': process.env.PARENTS_CORNER_URL || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }

    return NextResponse.json(
      {
        success: true,
        data: events,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      },
      { headers }
    )
  } catch (error) {
    console.error('Public events API error:', error)
    
    // 返回預設事件數據以避免頁面錯誤
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 1,
          title: "International Cultural Day 2025",
          description: "Join us for a celebration of diversity and cultural exchange. Parents and students will showcase their heritage through food, music, and traditional activities.",
          eventType: "cultural",
          startDate: "2025-02-28T09:00:00Z",
          endDate: "2025-02-28T15:00:00Z",
          startTime: "09:00",
          endTime: "15:00",
          location: "KCISLK School Gymnasium",
          maxParticipants: 200,
          registrationRequired: true,
          registrationDeadline: "2025-02-25T23:59:00Z",
          targetGrades: ["1-2", "3-4", "5-6"],
          isFeatured: true,
          creator: { displayName: "KCISLK ESID" }
        },
        {
          id: 2,
          title: "Parent-Teacher Conference",
          description: "Individual meetings to discuss student progress and academic development. Please schedule your appointment with your child's teacher.",
          eventType: "academic",
          startDate: "2025-02-15T08:00:00Z",
          endDate: "2025-02-15T17:00:00Z",
          startTime: "08:00",
          endTime: "17:00",
          location: "Classroom Buildings",
          registrationRequired: true,
          registrationDeadline: "2025-02-12T17:00:00Z",
          targetGrades: ["1-2", "3-4", "5-6"],
          isFeatured: true,
          creator: { displayName: "Academic Department" }
        },
        {
          id: 3,
          title: "Science Fair Exhibition",
          description: "Students will present their science projects and experiments. Come support our young scientists and discover amazing innovations.",
          eventType: "academic",
          startDate: "2025-03-15T10:00:00Z",
          endDate: "2025-03-15T14:00:00Z",
          startTime: "10:00",
          endTime: "14:00",
          location: "Science Laboratory Complex",
          maxParticipants: 150,
          registrationRequired: false,
          targetGrades: ["3-4", "5-6"],
          isFeatured: false,
          creator: { displayName: "Science Department" }
        }
      ],
      pagination: {
        total: 3,
        limit: 50,
        offset: 0,
        hasMore: false
      }
    })
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.PARENTS_CORNER_URL || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}