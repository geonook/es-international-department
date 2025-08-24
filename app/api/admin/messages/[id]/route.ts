import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'

/**
 * Message Board Post Details API - /api/admin/messages/[id]
 * 訊息公告板詳情 API
 * 
 * @description Handle individual message board post operations
 * @features Get, update, delete specific message board post
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/admin/messages/[id]
 * Get specific message board post with replies
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

    const messageId = parseInt(params.id)

    if (isNaN(messageId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid message board post ID' },
        { status: 400 }
      )
    }

    // Get message board post details with all replies
    const message = await prisma.messageBoard.findUnique({
      where: { id: messageId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        },
        replies: {
          orderBy: { createdAt: 'asc' },
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
        }
      }
    })

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message board post not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.messageBoard.update({
      where: { id: messageId },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: message
    })

  } catch (error) {
    console.error('Get message board post error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get message board post' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/messages/[id]
 * Update specific message board post
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

    const messageId = parseInt(params.id)

    if (isNaN(messageId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid message board post ID' },
        { status: 400 }
      )
    }

    // Parse request data
    const data = await request.json()

    // Check if message board post exists
    const existingMessage = await prisma.messageBoard.findUnique({
      where: { id: messageId }
    })

    if (!existingMessage) {
      return NextResponse.json(
        { success: false, message: 'Message board post not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) updateData.content = data.content
    if (data.boardType !== undefined) updateData.boardType = data.boardType
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned
    if (data.status !== undefined) updateData.status = data.status

    // Update message board post
    const updatedMessage = await prisma.messageBoard.update({
      where: { id: messageId },
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
        },
        replies: {
          take: 3,
          orderBy: { createdAt: 'desc' },
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Message board post updated successfully',
      data: updatedMessage
    })

  } catch (error) {
    console.error('Update message board post error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update message board post' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/messages/[id]
 * Delete specific message board post
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

    const messageId = parseInt(params.id)

    if (isNaN(messageId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid message board post ID' },
        { status: 400 }
      )
    }

    // Check if message board post exists
    const existingMessage = await prisma.messageBoard.findUnique({
      where: { id: messageId }
    })

    if (!existingMessage) {
      return NextResponse.json(
        { success: false, message: 'Message board post not found' },
        { status: 404 }
      )
    }

    // Delete all replies first (cascade delete)
    await prisma.messageReply.deleteMany({
      where: { messageId: messageId }
    })

    // Delete message board post
    await prisma.messageBoard.delete({
      where: { id: messageId }
    })

    return NextResponse.json({
      success: true,
      message: 'Message board post deleted successfully'
    })

  } catch (error) {
    console.error('Delete message board post error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete message board post' },
      { status: 500 }
    )
  }
}