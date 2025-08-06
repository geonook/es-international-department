/**
 * Bulk Resource Operations API - ES International Department
 * 大量資源操作 API - ES 國際部
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AUTH_ERRORS, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface BulkActionRequest {
  action: string
  resourceIds: number[]
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin permissions
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED },
        { status: 401 }
      )
    }

    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.ACCESS_DENIED },
        { status: 403 }
      )
    }

    const body: BulkActionRequest = await request.json()
    const { action, resourceIds } = body

    if (!action || !resourceIds || !Array.isArray(resourceIds) || resourceIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid action or resource IDs' },
        { status: 400 }
      )
    }

    let updateData: any = {}
    let actionDescription = ''

    // Define update data based on action
    switch (action) {
      case 'publish':
        updateData = { status: 'published' }
        actionDescription = 'published'
        break
      case 'archive':
        updateData = { status: 'archived' }
        actionDescription = 'archived'
        break
      case 'draft':
        updateData = { status: 'draft' }
        actionDescription = 'set to draft'
        break
      case 'feature':
        updateData = { isFeatured: true }
        actionDescription = 'featured'
        break
      case 'unfeature':
        updateData = { isFeatured: false }
        actionDescription = 'unfeatured'
        break
      case 'delete':
        // Handle deletion separately
        try {
          const deleteResult = await prisma.resource.deleteMany({
            where: {
              id: {
                in: resourceIds
              }
            }
          })

          return NextResponse.json({
            success: true,
            message: `Successfully deleted ${deleteResult.count} resources`,
            affectedCount: deleteResult.count
          })
        } catch (deleteError) {
          console.error('Bulk delete error:', deleteError)
          return NextResponse.json(
            { success: false, error: 'Failed to delete resources' },
            { status: 500 }
          )
        }
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    // Perform bulk update
    const updateResult = await prisma.resource.updateMany({
      where: {
        id: {
          in: resourceIds
        }
      },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    // Log the bulk action (optional - you might want to add an audit log table)
    console.log(`Bulk action performed: ${action} on ${updateResult.count} resources by user ${currentUser.email}`)

    return NextResponse.json({
      success: true,
      message: `Successfully ${actionDescription} ${updateResult.count} resources`,
      affectedCount: updateResult.count
    })

  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}