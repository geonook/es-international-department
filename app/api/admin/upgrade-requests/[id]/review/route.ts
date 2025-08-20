/**
 * Permission Upgrade Request Review API
 * 權限升級請求審核 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

/**
 * POST /api/admin/upgrade-requests/[id]/review
 * Review (approve/reject) a permission upgrade request
 * 審核（批准/拒絕）權限升級請求
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id

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
    const canReviewRequests = await hasPermission(currentUser.id, 'admin:users_manage')
    if (!canReviewRequests) {
      return NextResponse.json({
        success: false,
        error: 'Admin permissions required'
      }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { decision, reviewNotes } = body

    // Validate decision
    if (!decision || !['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({
        success: false,
        error: 'Valid decision (approved/rejected) is required'
      }, { status: 400 })
    }

    // Find the upgrade request
    const upgradeRequest = await prisma.permissionUpgradeRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          }
        }
      }
    })

    if (!upgradeRequest) {
      return NextResponse.json({
        success: false,
        error: 'Upgrade request not found'
      }, { status: 404 })
    }

    // Check if request is still pending
    if (upgradeRequest.status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: 'Request has already been reviewed'
      }, { status: 400 })
    }

    // Use transaction to handle the review process
    const result = await prisma.$transaction(async (tx) => {
      // Update the upgrade request
      const updatedRequest = await tx.permissionUpgradeRequest.update({
        where: { id: requestId },
        data: {
          status: decision,
          reviewNotes: reviewNotes || null,
          reviewedBy: currentUser.id,
          reviewedAt: new Date()
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
        }
      })

      // If approved, assign the role to the user
      if (decision === 'approved') {
        // Find the role
        const role = await tx.role.findUnique({
          where: { name: upgradeRequest.requestedRole }
        })

        if (!role) {
          throw new Error(`Role ${upgradeRequest.requestedRole} not found`)
        }

        // Check if user already has this role
        const existingUserRole = await tx.userRole.findFirst({
          where: {
            userId: upgradeRequest.userId,
            roleId: role.id
          }
        })

        if (!existingUserRole) {
          // Assign the new role
          await tx.userRole.create({
            data: {
              userId: upgradeRequest.userId,
              roleId: role.id,
              assignedBy: currentUser.id,
              assignedAt: new Date()
            }
          })
        }
      }

      return updatedRequest
    })

    return NextResponse.json({
      success: true,
      message: `Permission upgrade request ${decision} successfully`,
      data: result
    })

  } catch (error) {
    console.error('Review upgrade request error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/upgrade-requests/[id]/review
 * Get upgrade request details for review
 * 獲取升級請求詳情以進行審核
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id

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
    const canReviewRequests = await hasPermission(currentUser.id, 'admin:users_manage')
    if (!canReviewRequests) {
      return NextResponse.json({
        success: false,
        error: 'Admin permissions required'
      }, { status: 403 })
    }

    // Find the upgrade request with detailed information
    const upgradeRequest = await prisma.permissionUpgradeRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatarUrl: true,
            createdAt: true,
            lastLoginAt: true
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
      }
    })

    if (!upgradeRequest) {
      return NextResponse.json({
        success: false,
        error: 'Upgrade request not found'
      }, { status: 404 })
    }

    // Get user's current roles
    const userRoles = await prisma.userRole.findMany({
      where: { userId: upgradeRequest.userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...upgradeRequest,
        user: {
          ...upgradeRequest.user,
          currentRoles: userRoles.map(ur => ur.role)
        }
      }
    })

  } catch (error) {
    console.error('Get upgrade request error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}