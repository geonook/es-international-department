import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth, requireAdmin } from '@/lib/auth'
import { EventFormData } from '@/lib/types'

/**
 * Admin Event API - GET /api/admin/events/[id]
 * 管理員活動 API - 獲取單一活動詳情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, message: '未授權訪問' }, { status: 401 })
    }

    const adminCheck = await requireAdmin(authResult.user.id)
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, message: '權限不足' }, { status: 403 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: '無效的活動ID' },
        { status: 400 }
      )
    }

    // 獲取活動詳情
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
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

    if (!event) {
      return NextResponse.json(
        { success: false, message: '活動不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: event
    })

  } catch (error) {
    console.error('Get event error:', error)
    return NextResponse.json(
      { success: false, message: '獲取活動失敗' },
      { status: 500 }
    )
  }
}

/**
 * Admin Event API - PUT /api/admin/events/[id]
 * 管理員活動 API - 更新活動
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, message: '未授權訪問' }, { status: 401 })
    }

    const adminCheck = await requireAdmin(authResult.user.id)
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, message: '權限不足' }, { status: 403 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: '無效的活動ID' },
        { status: 400 }
      )
    }

    // 檢查活動是否存在
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, message: '活動不存在' },
        { status: 404 }
      )
    }

    // 解析請求資料
    const data: EventFormData = await request.json()

    // 驗證必填欄位
    if (!data.title || !data.eventType || !data.startDate || !data.status) {
      return NextResponse.json(
        { success: false, message: '缺少必填欄位' },
        { status: 400 }
      )
    }

    // 驗證日期邏輯
    if (data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      return NextResponse.json(
        { success: false, message: '結束日期不能早於開始日期' },
        { status: 400 }
      )
    }

    // 準備更新資料
    const updateData: any = {
      title: data.title,
      description: data.description,
      eventType: data.eventType,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      startTime: data.startTime ? new Date(`1970-01-01T${data.startTime}:00`) : null,
      endTime: data.endTime ? new Date(`1970-01-01T${data.endTime}:00`) : null,
      location: data.location,
      maxParticipants: data.maxParticipants,
      registrationRequired: data.registrationRequired,
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
      targetGrades: data.targetGrades || [],
      status: data.status,
      updatedAt: new Date()
    }

    // 更新活動
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        creator: {
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
      message: '活動更新成功',
      data: updatedEvent
    })

  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { success: false, message: '更新活動失敗' },
      { status: 500 }
    )
  }
}

/**
 * Admin Event API - DELETE /api/admin/events/[id]
 * 管理員活動 API - 刪除活動
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, message: '未授權訪問' }, { status: 401 })
    }

    const adminCheck = await requireAdmin(authResult.user.id)
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, message: '權限不足' }, { status: 403 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: '無效的活動ID' },
        { status: 400 }
      )
    }

    // 檢查活動是否存在
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, message: '活動不存在' },
        { status: 404 }
      )
    }

    // 檢查是否有相關的報名記錄（如果有報名系統的話）
    // 這裡可以添加檢查邏輯，例如：
    // const registrations = await prisma.eventRegistration.count({
    //   where: { eventId }
    // })
    // if (registrations > 0) {
    //   return NextResponse.json(
    //     { success: false, message: '無法刪除已有報名記錄的活動' },
    //     { status: 400 }
    //   )
    // }

    // 刪除活動
    await prisma.event.delete({
      where: { id: eventId }
    })

    return NextResponse.json({
      success: true,
      message: '活動刪除成功'
    })

  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { success: false, message: '刪除活動失敗' },
      { status: 500 }
    )
  }
}