/**
 * Permission Upgrade Requests Management API
 * 權限升級請求管理 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/upgrade-requests
 * Get all permission upgrade requests (admin only)
 * 獲取所有權限升級請求（僅管理員）
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyJWT(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const currentUser = authResult.user

    // Check admin permissions
    const canManageRequests = await hasPermission(currentUser.id, 'admin:users_manage')
    if (!canManageRequests) {
      return NextResponse.json({
        success: false,
        error: 'Admin permissions required'
      }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.status = status
    }

    // Fetch upgrade requests with pagination
    const [upgradeRequests, totalCount] = await Promise.all([
      prisma.permissionUpgradeRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true,
              avatarUrl: true
            }
          },
          requestedByUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true
            }
          },
          reviewedByUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true
            }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.permissionUpgradeRequest.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: upgradeRequests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Fetch upgrade requests error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}