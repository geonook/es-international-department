/**
 * User Approval API
 * 用戶批准 API - 啟用用戶並分配預設角色
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

/**
 * POST /api/admin/users/[id]/approve
 * Approve a pending user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 檢查管理員權限
    const adminCheckResult = await requireAdmin(request)
    if (adminCheckResult instanceof NextResponse) {
      return adminCheckResult
    }

    const userId = params.id
    const currentUser = adminCheckResult

    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          message: '用戶不存在' 
        },
        { status: 404 }
      )
    }

    // 檢查用戶是否為待審核狀態
    if (user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User already active',
          message: '用戶已經是啟用狀態' 
        },
        { status: 400 }
      )
    }

    // 解析請求體獲取角色資訊
    let roleToAssign = 'office_member' // 預設角色
    try {
      const body = await request.json()
      if (body.role && typeof body.role === 'string') {
        roleToAssign = body.role
      }
    } catch {
      // 使用預設角色
    }

    // 查找角色
    const role = await prisma.role.findUnique({
      where: { name: roleToAssign }
    })

    if (!role) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Role not found',
          message: `角色 ${roleToAssign} 不存在` 
        },
        { status: 400 }
      )
    }

    // 使用交易來更新用戶狀態和分配角色
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 啟用用戶
      const activatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          isActive: true,
          updatedAt: new Date()
        }
      })

      // 分配角色
      await tx.userRole.create({
        data: {
          userId: userId,
          roleId: role.id,
          assignedBy: currentUser.id
        }
      })

      // 返回更新後的用戶資訊
      return await tx.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: `用戶 ${user.email} 已成功批准並分配 ${role.displayName} 角色`,
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        firstName: updatedUser!.firstName,
        lastName: updatedUser!.lastName,
        displayName: updatedUser!.displayName,
        isActive: updatedUser!.isActive,
        roles: updatedUser!.userRoles.map(ur => ({
          id: ur.role.id,
          name: ur.role.name,
          displayName: ur.role.displayName
        }))
      }
    })

  } catch (error) {
    console.error('User approval error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '批准用戶時發生錯誤，請稍後再試' 
      },
      { status: 500 }
    )
  }
}