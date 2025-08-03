/**
 * Resource Categories API Route - ES International Department
 * 資源分類 API 端點 - ES 國際部
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Category schema
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  displayName: z.string().min(1, 'Display name is required').max(200),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true)
})

// GET - Fetch all categories
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

    const categories = await prisma.resourceCategory.findMany({
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
        { displayName: 'asc' }
      ]
    })

    // Add resource counts
    const categoriesWithCounts = categories.map(category => ({
      ...category,
      resourceCount: category.resources.length,
      publishedResourceCount: category.resources.filter(r => r.status === 'published').length
    }))

    return NextResponse.json({
      success: true,
      data: categoriesWithCounts
    })

  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new category
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
    const validatedData = categorySchema.parse(body)

    // Check if category name already exists
    const existingCategory = await prisma.resourceCategory.findUnique({
      where: { name: validatedData.name }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.resourceCategory.create({
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
        ...category,
        resourceCount: 0,
        publishedResourceCount: 0
      },
      message: 'Category created successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Category creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}