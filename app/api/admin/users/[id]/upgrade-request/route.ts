/**
 * User Permission Upgrade Request API
 * 用戶權限升級請求 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

/**
 * POST /api/admin/users/[id]/upgrade-request
 * Create a permission upgrade request
 * 創建權限升級請求
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Verify authentication
    const authResult = await verifyJWT(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const currentUser = authResult.user

    // Parse request body
    const body = await request.json()
    const { requestedRole, reason } = body

    // Validate request data
    if (!requestedRole || !reason) {
      return NextResponse.json({
        success: false,
        error: 'Requested role and reason are required'
      }, { status: 400 })
    }

    // Validate requested role
    const validRoles = ['office_member', 'admin']
    if (!validRoles.includes(requestedRole)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid requested role'
      }, { status: 400 })
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!targetUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    // Users can only request upgrades for themselves, or admins can create requests for others
    const canCreateRequest = 
      currentUser.id === userId || 
      await hasPermission(currentUser.id, 'admin:users_manage')

    if (!canCreateRequest) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 })
    }

    // Check if user already has the requested role or higher
    const currentRoles = targetUser.userRoles.map(ur => ur.role.name)
    if (currentRoles.includes(requestedRole) || 
        (requestedRole === 'office_member' && currentRoles.includes('admin'))) {
      return NextResponse.json({
        success: false,
        error: 'User already has the requested role or higher'
      }, { status: 400 })
    }

    // Check if there's already a pending request for this role
    const existingRequest = await prisma.permissionUpgradeRequest.findFirst({
      where: {
        userId: userId,
        requestedRole: requestedRole,
        status: 'pending'
      }
    })

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'A pending upgrade request already exists for this role'
      }, { status: 400 })
    }

    // Create the upgrade request
    const upgradeRequest = await prisma.permissionUpgradeRequest.create({
      data: {
        userId: userId,
        requestedRole: requestedRole,
        reason: reason,
        requestedBy: currentUser.id,
        status: 'pending',
        submittedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Permission upgrade request created successfully',
      data: upgradeRequest
    })

  } catch (error) {
    console.error('Permission upgrade request creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/users/[id]/upgrade-request
 * Get user's upgrade requests
 * 獲取用戶的升級請求
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Verify authentication
    const authResult = await verifyJWT(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const currentUser = authResult.user

    // Users can only view their own requests, or admins can view all
    const canViewRequests = 
      currentUser.id === userId || 
      await hasPermission(currentUser.id, 'admin:users_manage')

    if (!canViewRequests) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 })
    }

    // Fetch upgrade requests
    const upgradeRequests = await prisma.permissionUpgradeRequest.findMany({
      where: { userId: userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
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
      }
    })

    return NextResponse.json({
      success: true,
      data: upgradeRequests
    })

  } catch (error) {
    console.error('Fetch upgrade requests error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}