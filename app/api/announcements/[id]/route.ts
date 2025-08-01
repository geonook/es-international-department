/**
 * Individual Announcement API - Get, Update, Delete
 * 單一公告 API - 查詢、更新、刪除端點
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, isAdmin, isTeacher, AUTH_ERRORS } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/announcements/[id] - 取得單一公告詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcementId = parseInt(params.id)

    if (isNaN(announcementId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid announcement ID',
          message: '無效的公告 ID' 
        },
        { status: 400 }
      )
    }

    // 查詢公告
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        author: {
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

    if (!announcement) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Announcement not found',
          message: '公告不存在' 
        },
        { status: 404 }
      )
    }

    // 檢查公告是否已過期或未發布（對於一般使用者）
    const currentUser = await getCurrentUser()
    const isAuthorizedUser = currentUser && (isAdmin(currentUser) || isTeacher(currentUser))
    
    if (!isAuthorizedUser) {
      // 一般使用者只能看到已發布且未過期的公告
      if (announcement.status !== 'published') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Announcement not found',
            message: '公告不存在' 
          },
          { status: 404 }
        )
      }

      if (announcement.expiresAt && announcement.expiresAt < new Date()) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Announcement has expired',
            message: '公告已過期' 
          },
          { status: 410 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: announcement
    })

  } catch (error) {
    console.error('Get Announcement API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '伺服器內部錯誤' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/announcements/[id] - 更新公告
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 檢查使用者認證
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: '請先登入' 
        },
        { status: 401 }
      )
    }

    const announcementId = parseInt(params.id)

    if (isNaN(announcementId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid announcement ID',
          message: '無效的公告 ID' 
        },
        { status: 400 }
      )
    }

    // 查詢現有公告
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: announcementId }
    })

    if (!existingAnnouncement) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Announcement not found',
          message: '公告不存在' 
        },
        { status: 404 }
      )
    }

    // 檢查權限：需要是管理員或公告作者
    const isAuthor = existingAnnouncement.authorId === currentUser.id
    if (!isAdmin(currentUser) && !isAuthor) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: '權限不足：只能修改自己的公告或需要管理員權限' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      title, 
      content, 
      summary,
      targetAudience,
      priority,
      status,
      publishedAt,
      expiresAt 
    } = body

    // 建立更新資料物件
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (summary !== undefined) updateData.summary = summary
    if (targetAudience !== undefined) {
      // 驗證 targetAudience 值
      const validAudiences = ['teachers', 'parents', 'all']
      if (!validAudiences.includes(targetAudience)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid target audience',
            message: '無效的目標對象' 
          },
          { status: 400 }
        )
      }
      updateData.targetAudience = targetAudience
    }
    
    if (priority !== undefined) {
      // 驗證 priority 值
      const validPriorities = ['low', 'medium', 'high']
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid priority',
            message: '無效的優先等級' 
          },
          { status: 400 }
        )
      }
      updateData.priority = priority
    }
    
    if (status !== undefined) {
      // 驗證 status 值
      const validStatuses = ['draft', 'published', 'archived']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid status',
            message: '無效的狀態' 
          },
          { status: 400 }
        )
      }
      updateData.status = status
      
      // 如果狀態改為已發布且沒有發布時間，設定為現在
      if (status === 'published' && !existingAnnouncement.publishedAt && !publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt ? new Date(publishedAt) : null
    }
    
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
    }

    // 更新公告
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: updateData,
      include: {
        author: {
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
      message: '公告更新成功',
      data: updatedAnnouncement
    })

  } catch (error) {
    console.error('Update Announcement API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '更新公告失敗，請稍後再試' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/announcements/[id] - 刪除公告
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 檢查使用者認證
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: '請先登入' 
        },
        { status: 401 }
      )
    }

    const announcementId = parseInt(params.id)

    if (isNaN(announcementId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid announcement ID',
          message: '無效的公告 ID' 
        },
        { status: 400 }
      )
    }

    // 查詢現有公告
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: announcementId }
    })

    if (!existingAnnouncement) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Announcement not found',
          message: '公告不存在' 
        },
        { status: 404 }
      )
    }

    // 檢查權限：需要是管理員或公告作者
    const isAuthor = existingAnnouncement.authorId === currentUser.id
    if (!isAdmin(currentUser) && !isAuthor) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: '權限不足：只能刪除自己的公告或需要管理員權限' 
        },
        { status: 403 }
      )
    }

    // 刪除公告
    await prisma.announcement.delete({
      where: { id: announcementId }
    })

    return NextResponse.json({
      success: true,
      message: '公告刪除成功'
    })

  } catch (error) {
    console.error('Delete Announcement API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '刪除公告失敗，請稍後再試' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// 不支援的 HTTP 方法
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}