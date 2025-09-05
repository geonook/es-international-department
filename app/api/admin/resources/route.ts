/**
 * Admin Resources API Route - KCISLK ESID Info Hub
 * 管理員資源 API 端點 - KCISLK ESID Info Hub
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Resource creation/update schema
const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  resourceType: z.enum(['PDF', 'Video', 'Interactive', 'External Platform', 'Image', 'Document']),
  fileUrl: z.string().optional(),
  externalUrl: z.string().url().optional(),
  thumbnailUrl: z.string().optional(),
  gradeLevelId: z.number().optional(),
  categoryId: z.number().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  accessLevel: z.enum(['public', 'teachers', 'grade_specific']).default('public'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  subject: z.string().optional(),
})

// GET - Fetch resources with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin permission
    const userRoles = await prisma.userRole.findMany({
      where: { userId: currentUser.id },
      include: { role: true }
    })
    
    const isAdmin = userRoles.some(ur => ur.role.name === 'admin')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const gradeLevelId = searchParams.get('gradeLevelId')
    const status = searchParams.get('status')
    const resourceType = searchParams.get('resourceType')
    const isFeatured = searchParams.get('isFeatured')

    const skip = (page - 1) * limit

    // Build filter conditions
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }
    
    if (gradeLevelId) {
      where.gradeLevelId = parseInt(gradeLevelId)
    }
    
    if (status) {
      where.status = status
    }
    
    if (resourceType) {
      where.resourceType = resourceType
    }
    
    if (isFeatured) {
      where.isFeatured = isFeatured === 'true'
    }

    // Fetch resources
    const [resources, totalCount] = await Promise.all([
      prisma.resource.findMany({
        where,
        include: {
          gradeLevel: true,
          category: true,
          creator: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.resource.count({ where })
    ])

    // Transform resources for frontend
    const transformedResources = resources.map(resource => ({
      ...resource,
      fileSize: resource.fileSize ? Number(resource.fileSize) : null,
      tags: resource.tags.map(rt => rt.tag.name)
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: transformedResources,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('Resources fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new resource
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin permission
    const userRoles = await prisma.userRole.findMany({
      where: { userId: currentUser.id },
      include: { role: true }
    })
    
    const isAdmin = userRoles.some(ur => ur.role.name === 'admin')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = resourceSchema.parse(body)

    // Create resource
    const resource = await prisma.resource.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        resourceType: validatedData.resourceType,
        fileUrl: validatedData.fileUrl,
        externalUrl: validatedData.externalUrl,
        thumbnailUrl: validatedData.thumbnailUrl,
        gradeLevelId: validatedData.gradeLevelId,
        categoryId: validatedData.categoryId,
        createdBy: currentUser.id,
        isFeatured: validatedData.isFeatured,
        status: validatedData.status
      },
      include: {
        gradeLevel: true,
        category: true,
        creator: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      }
    })

    // Handle tags if provided
    if (validatedData.tags && validatedData.tags.length > 0) {
      // Create or find tags
      const tagRecords = await Promise.all(
        validatedData.tags.map(async (tagName) => {
          return await prisma.resourceTag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName }
          })
        })
      )

      // Link tags to resource
      await Promise.all(
        tagRecords.map(async (tag) => {
          return await prisma.resourceTagRelation.create({
            data: {
              resourceId: resource.id,
              tagId: tag.id
            }
          })
        })
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...resource,
        fileSize: resource.fileSize ? Number(resource.fileSize) : null
      },
      message: 'Resource created successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Resource creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}