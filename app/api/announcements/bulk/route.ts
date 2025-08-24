/**
 * Bulk Announcements Operations API
 * 批量公告操作 API 端點
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, isAdmin, isTeacher, AUTH_ERRORS } from '@/lib/auth'
import {
  BulkAnnouncementOperation,
  BulkAnnouncementResult,
  BulkAnnouncementAction
} from '@/lib/types'

const prisma = new PrismaClient()

// POST /api/announcements/bulk - Bulk operations on announcements
export async function POST(request: NextRequest) {
  try {
    // Check user authentication
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Please log in first' 
        },
        { status: 401 }
      )
    }

    // Check permissions: requires admin or teacher role
    if (!isAdmin(currentUser) && !isTeacher(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions: admin or teacher role required' 
        },
        { status: 403 }
      )
    }

    const body: BulkAnnouncementOperation = await request.json()
    const { action, announcementIds, targetStatus } = body

    // Validate required fields
    if (!action || !announcementIds || !Array.isArray(announcementIds) || announcementIds.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body',
          message: 'Action and announcement IDs are required' 
        },
        { status: 400 }
      )
    }

    // Validate action type
    const validActions: BulkAnnouncementAction[] = ['publish', 'archive', 'delete', 'draft']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid action',
          message: 'Invalid bulk action specified' 
        },
        { status: 400 }
      )
    }

    // Initialize result tracking
    const result: BulkAnnouncementResult = {
      success: true,
      totalProcessed: announcementIds.length,
      totalSuccess: 0,
      totalFailed: 0,
      results: {
        success: [],
        failed: []
      },
      message: ''
    }

    // Process each announcement ID
    for (const announcementId of announcementIds) {
      try {
        switch (action) {
          case 'publish':
            await prisma.announcement.update({
              where: { 
                id: announcementId,
                // Only allow non-admins to modify their own announcements
                ...(!isAdmin(currentUser) && { authorId: currentUser.id })
              },
              data: { 
                status: 'published',
                publishedAt: new Date()
              }
            })
            result.results.success.push(announcementId)
            result.totalSuccess++
            break

          case 'archive':
            await prisma.announcement.update({
              where: { 
                id: announcementId,
                ...(!isAdmin(currentUser) && { authorId: currentUser.id })
              },
              data: { 
                status: 'archived'
              }
            })
            result.results.success.push(announcementId)
            result.totalSuccess++
            break

          case 'draft':
            await prisma.announcement.update({
              where: { 
                id: announcementId,
                ...(!isAdmin(currentUser) && { authorId: currentUser.id })
              },
              data: { 
                status: 'draft',
                publishedAt: null
              }
            })
            result.results.success.push(announcementId)
            result.totalSuccess++
            break

          case 'delete':
            await prisma.announcement.delete({
              where: { 
                id: announcementId,
                ...(!isAdmin(currentUser) && { authorId: currentUser.id })
              }
            })
            result.results.success.push(announcementId)
            result.totalSuccess++
            break

          default:
            result.results.failed.push({
              id: announcementId,
              error: 'Unknown action'
            })
            result.totalFailed++
        }
      } catch (error) {
        console.error(`Failed to process announcement ${announcementId}:`, error)
        result.results.failed.push({
          id: announcementId,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
        result.totalFailed++
      }
    }

    // Generate appropriate message
    const actionLabels = {
      publish: '發布',
      archive: '歸檔',
      delete: '刪除',
      draft: '轉為草稿'
    }

    if (result.totalFailed === 0) {
      result.message = `成功${actionLabels[action]} ${result.totalSuccess} 則公告`
    } else if (result.totalSuccess === 0) {
      result.message = `${actionLabels[action]}失敗，共 ${result.totalFailed} 則公告處理失敗`
      result.success = false
    } else {
      result.message = `部分${actionLabels[action]}成功：成功 ${result.totalSuccess} 則，失敗 ${result.totalFailed} 則`
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result
    }, { 
      status: result.success ? 200 : 207 // 207 Multi-Status for partial success
    })

  } catch (error) {
    console.error('Bulk Operation API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to perform bulk operation, please try again later' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET method not supported
export async function GET() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed',
      message: 'GET method not supported for bulk operations'
    },
    { status: 405 }
  )
}

// PUT method not supported  
export async function PUT() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed',
      message: 'PUT method not supported for bulk operations'
    },
    { status: 405 }
  )
}

// DELETE method not supported
export async function DELETE() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed',
      message: 'DELETE method not supported for bulk operations'
    },
    { status: 405 }
  )
}