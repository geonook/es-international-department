/**
 * Grade Levels API Route - KCISLK ESID Info Hub
 * 年級層級 API 端點 - KCISLK ESID Info Hub
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Grade level schema
const gradeLevelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(20),
  displayName: z.string().min(1, 'Display name is required').max(50),
  minGrade: z.number().min(1).max(12),
  maxGrade: z.number().min(1).max(12),
  color: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true)
})

// GET - Fetch all grade levels
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = includeInactive ? {} : { isActive: true }

    const gradeLevels = await prisma.gradeLevel.findMany({
      where,
      include: {
        resources: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { minGrade: 'asc' }
      ]
    })

    // Add resource counts
    const gradeLevelsWithCounts = gradeLevels.map(gradeLevel => ({
      ...gradeLevel,
      resourceCount: gradeLevel.resources.length,
      publishedResourceCount: gradeLevel.resources.filter(r => r.status === 'published').length
    }))

    return NextResponse.json({
      success: true,
      data: gradeLevelsWithCounts
    })

  } catch (error) {
    console.error('Grade levels fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new grade level
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
    const validatedData = gradeLevelSchema.parse(body)

    // Validate grade range
    if (validatedData.minGrade > validatedData.maxGrade) {
      return NextResponse.json(
        { error: 'Minimum grade cannot be greater than maximum grade' },
        { status: 400 }
      )
    }

    // Check if grade level name already exists
    const existingGradeLevel = await prisma.gradeLevel.findUnique({
      where: { name: validatedData.name }
    })

    if (existingGradeLevel) {
      return NextResponse.json(
        { error: 'Grade level name already exists' },
        { status: 400 }
      )
    }

    const gradeLevel = await prisma.gradeLevel.create({
      data: validatedData,
      include: {
        resources: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...gradeLevel,
        resourceCount: 0,
        publishedResourceCount: 0
      },
      message: 'Grade level created successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Grade level creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}