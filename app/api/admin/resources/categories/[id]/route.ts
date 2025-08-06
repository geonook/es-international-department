/**
 * Individual Resource Category API Route - KCISLK ESID Info Hub
 * 個別資源分類 API 端點 - KCISLK ESID Info Hub
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Category update schema
const categoryUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  displayName: z.string().min(1, 'Display name is required').max(200).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional()
})

// GET - Fetch single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const categoryId = parseInt(params.id)
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      )
    }

    const category = await prisma.resourceCategory.findUnique({
      where: { id: categoryId },
      include: {
        resources: {
          select: {
            id: true,
            status: true,
            title: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const categoryWithCounts = {
      ...category,
      resourceCount: category.resources.length,
      publishedResourceCount: category.resources.filter(r => r.status === 'published').length
    }

    return NextResponse.json({
      success: true,
      data: categoryWithCounts
    })

  } catch (error) {
    console.error('Category fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const categoryId = parseInt(params.id)
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      )
    }

    // Check if category exists
    const existingCategory = await prisma.resourceCategory.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = categoryUpdateSchema.parse(body)

    // Check if name is being changed and if new name already exists
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const nameExists = await prisma.resourceCategory.findUnique({
        where: { name: validatedData.name }
      })

      if (nameExists) {
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 400 }
        )
      }
    }

    const updatedCategory = await prisma.resourceCategory.update({
      where: { id: categoryId },
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

    const categoryWithCounts = {
      ...updatedCategory,
      resourceCount: updatedCategory.resources.length,
      publishedResourceCount: updatedCategory.resources.filter(r => r.status === 'published').length
    }

    return NextResponse.json({
      success: true,
      data: categoryWithCounts,
      message: 'Category updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Category update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const categoryId = parseInt(params.id)
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      )
    }

    // Check if category exists and has resources
    const category = await prisma.resourceCategory.findUnique({
      where: { id: categoryId },
      include: {
        resources: {
          select: { id: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has resources
    if (category.resources.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete category with ${category.resources.length} associated resources. Please move or delete the resources first.` 
        },
        { status: 400 }
      )
    }

    // Delete the category
    await prisma.resourceCategory.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })

  } catch (error) {
    console.error('Category deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}