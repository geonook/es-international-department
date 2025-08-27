/**
 * Batch Settings Management API for KCISLK ESID Info Hub
 * 批量設定管理 API - 管理員專用
 * 
 * Handles bulk updates to multiple system settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface BatchUpdateRequest {
  updates: Array<{
    key: string
    value: any
    description?: string
    dataType?: 'string' | 'number' | 'boolean' | 'json'
  }>
}

/**
 * PUT /api/admin/settings/batch
 * 批量更新多個系統設定
 */
export async function PUT(request: NextRequest) {
  try {
    // 檢查認證
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
    const { updates }: BatchUpdateRequest = await request.json()

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided or invalid format' },
        { status: 400 }
      )
    }

    // 驗證更新資料
    for (const update of updates) {
      if (!update.key || typeof update.key !== 'string') {
        return NextResponse.json(
          { error: 'Invalid update: missing or invalid key' },
          { status: 400 }
        )
      }
    }

    const results = []
    const errors = []

    // 批量處理更新
    for (const update of updates) {
      try {
        const { key, value, description, dataType = 'string' } = update

        // 檢查設定是否存在
        const existingSetting = await prisma.systemSetting.findUnique({
          where: { key }
        })

        if (existingSetting) {
          // 更新現有設定
          const updatedSetting = await prisma.systemSetting.update({
            where: { key },
            data: {
              value: String(value),
              description: description || existingSetting.description,
              dataType: dataType || existingSetting.dataType,
              updatedBy: currentUser.id
            },
            include: { updater: true }
          })
          results.push({
            key,
            action: 'updated',
            setting: updatedSetting
          })
        } else {
          // 創建新設定
          const newSetting = await prisma.systemSetting.create({
            data: {
              key,
              value: String(value),
              description: description || `Page content: ${key}`,
              dataType,
              updatedBy: currentUser.id
            },
            include: { updater: true }
          })
          results.push({
            key,
            action: 'created',
            setting: newSetting
          })
        }
      } catch (error) {
        console.error(`Error updating setting ${update.key}:`, error)
        errors.push({
          key: update.key,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        updated: results.length,
        total: updates.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `Successfully processed ${results.length}/${updates.length} settings`
    })

  } catch (error) {
    console.error('Batch Settings API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}