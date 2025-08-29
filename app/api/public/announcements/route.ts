import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Public API for Parents Corner
 * GET /api/public/announcements
 * 
 * Returns public announcements for parents
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch public announcements for parents
    const announcements = await prisma.announcement.findMany({
      where: {
        status: 'published',
        targetAudience: 'parents',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        priority: true,
        publishedAt: true,
        expiresAt: true,
        author: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const total = await prisma.announcement.count({
      where: {
        status: 'published',
        targetAudience: 'parents',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })

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
        data: announcements,
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
    console.error('Public announcements API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch announcements' 
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