/**
 * Individual Resource API Route - KCISLK ESID Info Hub
 * 個別資源 API 端點 - KCISLK ESID Info Hub
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Resource update schema
const resourceUpdateSchema = z.object({
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
})

interface RouteParams {
  params: { id: string }
}

// GET - Fetch individual resource
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const resourceId = parseInt(params.id)
    if (isNaN(resourceId)) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      )
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
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
      }
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Transform for frontend
    const transformedResource = {
      ...resource,
      fileSize: resource.fileSize ? Number(resource.fileSize) : null,
      tags: resource.tags.map(rt => rt.tag.name)
    }

    return NextResponse.json({
      success: true,
      data: transformedResource
    })

  } catch (error) {
    console.error('Resource fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update resource
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const resourceId = parseInt(params.id)
    if (isNaN(resourceId)) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = resourceUpdateSchema.parse(body)

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id: resourceId }
    })

    if (!existingResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Update resource
    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        resourceType: validatedData.resourceType,
        fileUrl: validatedData.fileUrl,
        externalUrl: validatedData.externalUrl,
        thumbnailUrl: validatedData.thumbnailUrl,
        gradeLevelId: validatedData.gradeLevelId,
        categoryId: validatedData.categoryId,
        isFeatured: validatedData.isFeatured,
        status: validatedData.status,
        updatedAt: new Date()
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

    // Handle tags update if provided
    if (validatedData.tags) {
      // Remove existing tag relations
      await prisma.resourceTagRelation.deleteMany({
        where: { resourceId: resourceId }
      })

      // Create new tag relations
      if (validatedData.tags.length > 0) {
        const tagRecords = await Promise.all(
          validatedData.tags.map(async (tagName) => {
            return await prisma.resourceTag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName }
            })
          })
        )

        await Promise.all(
          tagRecords.map(async (tag) => {
            return await prisma.resourceTagRelation.create({
              data: {
                resourceId: resourceId,
                tagId: tag.id
              }
            })
          })
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...resource,
        fileSize: resource.fileSize ? Number(resource.fileSize) : null
      },
      message: 'Resource updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Resource update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete resource
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const resourceId = parseInt(params.id)
    if (isNaN(resourceId)) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      )
    }

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id: resourceId }
    })

    if (!existingResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Delete tag relations first
    await prisma.resourceTagRelation.deleteMany({
      where: { resourceId: resourceId }
    })

    // Delete resource
    await prisma.resource.delete({
      where: { id: resourceId }
    })

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully'
    })

  } catch (error) {
    console.error('Resource deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}