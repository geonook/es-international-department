import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

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
    const sourceGroup = searchParams.get('sourceGroup') // Filter by source group

    // Build filter conditions - only show published posts
    const where: any = {
      type: 'message_board', // Filter for message board type
      status: 'published', // Use 'published' instead of 'active'
      OR: [
        { boardType: boardType },
        { boardType: 'general' } // Teachers can also see general posts
      ]
    }

    // Add source group filter if specified
    if (sourceGroup) {
      where.sourceGroup = sourceGroup
    }

    // Get published message board posts for teachers from unified Communication table
    const messages = await prisma.communication.findMany({
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
        { isImportant: 'desc' },
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Separate important, pinned and regular messages
    const importantMessages = messages.filter(m => m.isImportant)
    const pinnedMessages = messages.filter(m => m.isPinned && !m.isImportant)
    const regularMessages = messages.filter(m => !m.isPinned && !m.isImportant)

    // Group messages by source group
    const messagesByGroup = messages.reduce((acc, message) => {
      const group = message.sourceGroup || 'general'
      if (!acc[group]) acc[group] = []
      acc[group].push(message)
      return acc
    }, {} as Record<string, typeof messages>)

    return NextResponse.json({
      success: true,
      data: {
        important: importantMessages,
        pinned: pinnedMessages,
        regular: regularMessages,
        byGroup: messagesByGroup,
        total: messages.length,
        totalImportant: importantMessages.length,
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