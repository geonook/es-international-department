/**
 * Admin Individual User Management API
 * 管理員個別使用者管理 API - 需要管理員權限
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/users/[id]
 * 獲取單一使用者詳細資訊 (管理員專用)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 檢查管理員權限
  const adminUser = await requireAdmin(request)
  if (adminUser instanceof NextResponse) {
    return adminUser
  }

  try {
    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: '找不到指定的使用者'
        },
        { status: 404 }
      )
    }

    // 格式化使用者資料
    const formattedUser = {
      ...user,
      roles: user.userRoles.map(ur => ur.role)
    }

    return NextResponse.json({
      success: true,
      data: { user: formattedUser }
    })

  } catch (error) {
    console.error('Admin get user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
        message: '獲取使用者資訊失敗'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/users/[id]
 * 更新使用者資訊 (管理員專用)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 檢查管理員權限
  const adminUser = await requireAdmin(request)
  if (adminUser instanceof NextResponse) {
    return adminUser
  }

  try {
    const userId = params.id
    const body = await request.json()
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      displayName, 
      phone, 
      roles = [], 
      isActive 
    } = body

    // 檢查使用者是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: '找不到指定的使用者'
        },
        { status: 404 }
      )
    }

    // 檢查 email 是否已被其他使用者使用
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email already exists',
            message: '此 Email 已被使用'
          },
          { status: 400 }
        )
      }
    }

    // 準備更新資料
    const updateData: any = {
      firstName,
      lastName,
      displayName: displayName || `${firstName} ${lastName}`.trim(),
      phone,
      isActive
    }

    // 如果提供了 email，則更新
    if (email) {
      updateData.email = email
    }

    // 如果提供了新密碼，則更新密碼
    if (password) {
      const { hashPassword } = await import('@/lib/auth')
      updateData.passwordHash = await hashPassword(password)
    }

    // 使用交易來確保資料一致性
    const result = await prisma.$transaction(async (tx) => {
      // 更新使用者基本資訊
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          displayName: true,
          phone: true,
          isActive: true,
          updatedAt: true
        }
      })

      // 更新角色指派
      if (roles.length >= 0) {
        // 刪除現有角色
        await tx.userRole.deleteMany({
          where: { userId }
        })

        // 添加新角色
        if (roles.length > 0) {
          const roleAssignments = roles.map((roleId: number) => ({
            userId,
            roleId,
            assignedBy: adminUser.id
          }))

          await tx.userRole.createMany({
            data: roleAssignments
          })
        }
      }

      return updatedUser
    })

    return NextResponse.json({
      success: true,
      data: { user: result },
      message: '使用者資訊更新成功'
    })

  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        message: '更新使用者資訊失敗'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * 刪除使用者 (管理員專用)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 檢查管理員權限
  const adminUser = await requireAdmin(request)
  if (adminUser instanceof NextResponse) {
    return adminUser
  }

  try {
    const userId = params.id

    // 檢查使用者是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: '找不到指定的使用者'
        },
        { status: 404 }
      )
    }

    // 防止管理員刪除自己
    if (userId === adminUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete yourself',
          message: '無法刪除自己的帳戶'
        },
        { status: 400 }
      )
    }

    // 使用交易來確保資料一致性
    await prisma.$transaction(async (tx) => {
      // 刪除使用者角色關聯
      await tx.userRole.deleteMany({
        where: { userId }
      })

      // 刪除使用者相關的其他資料
      // 可以根據需要添加其他相關資料的清理

      // 刪除使用者
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({
      success: true,
      message: '使用者刪除成功'
    })

  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
        message: '刪除使用者失敗'
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/users/[id]
 * 部分更新使用者狀態 (管理員專用)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 檢查管理員權限
  const adminUser = await requireAdmin(request)
  if (adminUser instanceof NextResponse) {
    return adminUser
  }

  try {
    const userId = params.id
    const body = await request.json()
    const { action, value } = body

    // 檢查使用者是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: '找不到指定的使用者'
        },
        { status: 404 }
      )
    }

    let updateData: any = {}
    let message = ''

    switch (action) {
      case 'toggle_status':
        updateData.isActive = value
        message = value ? '使用者已啟用' : '使用者已停用'
        break
      
      case 'verify_email':
        updateData.emailVerified = true
        updateData.emailVerifiedAt = new Date()
        message = 'Email 已驗證'
        break
      
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            message: '無效的操作'
          },
          { status: 400 }
        )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        isActive: true,
        emailVerified: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
      message
    })

  } catch (error) {
    console.error('Admin patch user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        message: '更新使用者狀態失敗'
      },
      { status: 500 }
    )
  }
}