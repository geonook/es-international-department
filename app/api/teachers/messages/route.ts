import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'

/**
 * Teacher Message Board Public API - /api/teachers/messages
 * 教師訊息公告板公開 API
 * 
 * @description Public API for teachers to view message board posts (no admin required)
 * @features Get active message board posts for teachers
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/teachers/messages
 * Get active message board posts for teachers (public access for authenticated teachers)
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '20')
    const boardType = searchParams.get('boardType') || 'teachers' // Default to teachers board

    // Build filter conditions - only show active posts
    const where: any = {
      status: 'active',
      OR: [
        { boardType: boardType },
        { boardType: 'general' } // Teachers can also see general posts
      ]
    }

    // Get active message board posts for teachers
    const messages = await prisma.messageBoard.findMany({
      where,
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
          take: 3, // Get first 3 replies for preview
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
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Separate pinned and regular messages
    const pinnedMessages = messages.filter(m => m.isPinned)
    const regularMessages = messages.filter(m => !m.isPinned)

    return NextResponse.json({
      success: true,
      data: {
        pinned: pinnedMessages,
        regular: regularMessages,
        total: messages.length,
        totalPinned: pinnedMessages.length
      }
    })

  } catch (error) {
    console.error('Get teacher messages error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get teacher messages' },
      { status: 500 }
    )
  }
}