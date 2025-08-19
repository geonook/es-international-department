/**
 * User Rejection API
 * 用戶拒絕 API - 刪除或標記拒絕的用戶
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

/**
 * DELETE /api/admin/users/[id]/reject
 * Reject and remove a pending user
 */
export async function DELETE(
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
        userRoles: true,
        accounts: true
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
          error: 'Cannot reject active user',
          message: '無法拒絕已啟用的用戶' 
        },
        { status: 400 }
      )
    }

    // 防止刪除管理員或有角色的用戶
    if (user.userRoles.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot reject user with assigned roles',
          message: '無法拒絕已分配角色的用戶' 
        },
        { status: 400 }
      )
    }

    // 使用交易來刪除用戶及相關資料
    await prisma.$transaction(async (tx) => {
      // 刪除相關的 OAuth 帳戶記錄
      if (user.accounts.length > 0) {
        await tx.account.deleteMany({
          where: { userId: userId }
        })
      }

      // 刪除用戶角色（雖然應該沒有）
      await tx.userRole.deleteMany({
        where: { userId: userId }
      })

      // 刪除用戶
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({
      success: true,
      message: `用戶 ${user.email} 的註冊申請已被拒絕並刪除`,
      deletedUser: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || `${user.firstName} ${user.lastName}`.trim()
      }
    })

  } catch (error) {
    console.error('User rejection error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '拒絕用戶時發生錯誤，請稍後再試' 
      },
      { status: 500 }
    )
  }
}