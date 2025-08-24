/**
 * System Settings API for KCISLK ESID Info Hub
 * 系統設定 API - 管理員專用
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/settings
 * 獲取系統設定（管理員專用）
 */
export async function GET(request: NextRequest) {
  try {
    // 檢查認證和權限
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 檢查管理員權限
    const userRoles = await prisma.userRole.findMany({
      where: { userId: currentUser.id },
      include: { role: true }
    })

    const isAdmin = userRoles.some(ur => ur.role.name === 'admin')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // 獲取系統設定
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const publicOnly = searchParams.get('publicOnly') === 'true'

    let settings
    if (key) {
      // 獲取特定設定
      settings = await prisma.systemSetting.findUnique({
        where: { key },
        include: { updater: true }
      })
      
      if (!settings) {
        return NextResponse.json(
          { error: 'Setting not found' },
          { status: 404 }
        )
      }
    } else {
      // 獲取所有設定
      const whereClause: any = {}
      if (publicOnly) {
        whereClause.isPublic = true
      }

      settings = await prisma.systemSetting.findMany({
        where: whereClause,
        include: { updater: true },
        orderBy: { key: 'asc' }
      })
    }

    return NextResponse.json({
      success: true,
      data: settings,
      count: Array.isArray(settings) ? settings.length : 1
    })

  } catch (error) {
    console.error('Settings API GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings
 * 更新系統設定（管理員專用）
 */
export async function PUT(request: NextRequest) {
  try {
    // 檢查認證和權限
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 檢查管理員權限
    const userRoles = await prisma.userRole.findMany({
      where: { userId: currentUser.id },
      include: { role: true }
    })

    const isAdmin = userRoles.some(ur => ur.role.name === 'admin')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // 解析請求資料
    const body = await request.json()
    const { key, value, description, dataType } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }

    // 驗證資料類型
    const validDataTypes = ['string', 'number', 'boolean', 'json']
    if (dataType && !validDataTypes.includes(dataType)) {
      return NextResponse.json(
        { error: 'Invalid data type' },
        { status: 400 }
      )
    }

    // 資料類型驗證
    if (dataType === 'number' && isNaN(Number(value))) {
      return NextResponse.json(
        { error: 'Invalid number value' },
        { status: 400 }
      )
    }

    if (dataType === 'boolean' && !['true', 'false'].includes(String(value))) {
      return NextResponse.json(
        { error: 'Invalid boolean value' },
        { status: 400 }
      )
    }

    if (dataType === 'json') {
      try {
        JSON.parse(value)
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid JSON value' },
          { status: 400 }
        )
      }
    }

    // 更新或創建設定
    const updatedSetting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: String(value),
        description: description || undefined,
        dataType: dataType || 'string',
        updatedBy: currentUser.id,
      },
      create: {
        key,
        value: String(value),
        description: description || null,
        dataType: dataType || 'string',
        isPublic: false, // 預設為非公開
        updatedBy: currentUser.id,
      },
      include: { updater: true }
    })

    return NextResponse.json({
      success: true,
      data: updatedSetting,
      message: 'Setting updated successfully'
    })

  } catch (error) {
    console.error('Settings API PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/settings
 * 刪除系統設定（管理員專用）
 */
export async function DELETE(request: NextRequest) {
  try {
    // 檢查認證和權限
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 檢查管理員權限
    const userRoles = await prisma.userRole.findMany({
      where: { userId: currentUser.id },
      include: { role: true }
    })

    const isAdmin = userRoles.some(ur => ur.role.name === 'admin')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // 獲取要刪除的設定鍵
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }

    // 檢查設定是否存在
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { key }
    })

    if (!existingSetting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      )
    }

    // 刪除設定
    await prisma.systemSetting.delete({
      where: { key }
    })

    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully'
    })

  } catch (error) {
    console.error('Settings API DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}