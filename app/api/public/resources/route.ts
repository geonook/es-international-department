import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Public API for Parents Corner
 * GET /api/public/resources
 * 
 * Returns public resources for parents
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      status: 'published'
    }

    if (category) {
      where.categoryId = parseInt(category)
    }

    // Fetch public resources
    const resources = await prisma.resource.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        resourceType: true,
        fileUrl: true,
        externalUrl: true,
        fileSize: true,
        thumbnailUrl: true,
        downloadCount: true,
        viewCount: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        creator: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const total = await prisma.resource.count({ where })

    // Get categories for filtering
    const categories = await prisma.resourceCategory.findMany({
      select: {
        id: true,
        name: true
      }
    })

    // Set CORS headers for public access
    const headers = {
      'Access-Control-Allow-Origin': process.env.PARENTS_CORNER_URL || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }

    return NextResponse.json(
      {
        success: true,
        data: resources,
        categories: categories.map(c => ({ id: c.id, name: c.name })),
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
    console.error('Public resources API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch resources' 
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