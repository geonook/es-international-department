import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch events' 
      },
      { status: 500 }
    )
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