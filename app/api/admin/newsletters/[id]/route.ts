import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'

/**
 * Newsletter Details API - /api/admin/newsletters/[id]
 * 新聞簡報詳情 API
 * 
 * @description Handle individual newsletter operations
 * @features Get, update, delete specific newsletter
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/admin/newsletters/[id]
 * Get specific newsletter
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Unauthorized access' 
        }, 
        { status: 401 }
      )
    }

    // Check admin permissions
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions' 
        },
        { status: 403 }
      )
    }

    const newsletterId = parseInt(params.id)

    if (isNaN(newsletterId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid newsletter ID' },
        { status: 400 }
      )
    }

    // Get newsletter details
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!newsletter) {
      return NextResponse.json(
        { success: false, message: 'Newsletter not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newsletter
    })

  } catch (error) {
    console.error('Get newsletter error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get newsletter' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/newsletters/[id]
 * Update specific newsletter
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Unauthorized access' 
        }, 
        { status: 401 }
      )
    }

    // Check admin permissions
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions' 
        },
        { status: 403 }
      )
    }

    const newsletterId = parseInt(params.id)

    if (isNaN(newsletterId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid newsletter ID' },
        { status: 400 }
      )
    }

    // Parse request data
    const data = await request.json()

    // Check if newsletter exists
    const existingNewsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId }
    })

    if (!existingNewsletter) {
      return NextResponse.json(
        { success: false, message: 'Newsletter not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) updateData.content = data.content
    if (data.htmlContent !== undefined) updateData.htmlContent = data.htmlContent
    if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl
    if (data.status !== undefined) updateData.status = data.status
    if (data.issueNumber !== undefined) updateData.issueNumber = data.issueNumber
    if (data.publicationDate !== undefined) {
      updateData.publicationDate = data.publicationDate ? new Date(data.publicationDate) : null
    }

    // Update newsletter
    const updatedNewsletter = await prisma.newsletter.update({
      where: { id: newsletterId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Newsletter updated successfully',
      data: updatedNewsletter
    })

  } catch (error) {
    console.error('Update newsletter error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update newsletter' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/newsletters/[id]
 * Delete specific newsletter
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Unauthorized access' 
        }, 
        { status: 401 }
      )
    }

    // Check admin permissions
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions' 
        },
        { status: 403 }
      )
    }

    const newsletterId = parseInt(params.id)

    if (isNaN(newsletterId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid newsletter ID' },
        { status: 400 }
      )
    }

    // Check if newsletter exists
    const existingNewsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId }
    })

    if (!existingNewsletter) {
      return NextResponse.json(
        { success: false, message: 'Newsletter not found' },
        { status: 404 }
      )
    }

    // Delete newsletter
    await prisma.newsletter.delete({
      where: { id: newsletterId }
    })

    return NextResponse.json({
      success: true,
      message: 'Newsletter deleted successfully'
    })

  } catch (error) {
    console.error('Delete newsletter error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete newsletter' },
      { status: 500 }
    )
  }
}