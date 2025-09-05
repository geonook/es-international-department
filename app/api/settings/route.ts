/**
 * System Settings API for KCISLK ESID Info Hub
 * 系統設定 API - 支援公開設定和管理員設定存取
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

/**
 * GET /api/settings
 * 獲取系統設定 - 支援前綴過濾和管理員存取
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const prefix = searchParams.get('prefix')
    
    // 檢查是否為管理員請求
    const currentUser = await getCurrentUser()
    const isAdmin = currentUser ? await checkAdminAccess(currentUser.id) : false

    let settings
    if (key) {
      // 獲取特定設定
      const whereCondition = isAdmin 
        ? { key } 
        : { key, isPublic: true }
        
      settings = await prisma.systemSetting.findFirst({
        where: whereCondition,
        select: {
          id: true,
          key: true,
          value: true,
          description: true,
          dataType: true,
          updatedAt: true
        }
      })
      
      if (!settings) {
        return NextResponse.json(
          { error: 'Setting not found or not accessible' },
          { status: 404 }
        )
      }
    } else if (prefix) {
      // 獲取前綴匹配的設定（僅限管理員）
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Admin access required for prefix search' },
          { status: 403 }
        )
      }
      
      settings = await prisma.systemSetting.findMany({
        where: {
          key: {
            startsWith: prefix
          }
        },
        select: {
          id: true,
          key: true,
          value: true,
          description: true,
          dataType: true,
          updatedAt: true
        },
        orderBy: { key: 'asc' }
      })
    } else {
      // 獲取所有可存取的設定
      const whereCondition = isAdmin ? {} : { isPublic: true }
      
      settings = await prisma.systemSetting.findMany({
        where: whereCondition,
        select: {
          id: true,
          key: true,
          value: true,
          description: true,
          dataType: true,
          updatedAt: true
        },
        orderBy: { key: 'asc' }
      })
    }

    // 處理資料類型轉換
    const processedSettings = Array.isArray(settings) 
      ? settings.map(processSettingValue)
      : processSettingValue(settings)

    return NextResponse.json({
      success: true,
      data: processedSettings,
      count: Array.isArray(settings) ? settings.length : 1
    })

  } catch (error) {
    console.error('Public Settings API GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * 檢查用戶是否具有管理員權限
 */
async function checkAdminAccess(userId: string): Promise<boolean> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true }
    })
    
    return userRoles.some(ur => ur.role.name === 'admin')
  } catch (error) {
    console.error('Error checking admin access:', error)
    return false
  }
}

/**
 * 處理設定值的資料類型轉換
 */
function processSettingValue(setting: any) {
  if (!setting) return setting
  
  let processedValue = setting.value
  
  switch (setting.dataType) {
    case 'number':
      processedValue = Number(setting.value)
      break
    case 'boolean':
      processedValue = setting.value === 'true'
      break
    case 'json':
      try {
        processedValue = JSON.parse(setting.value)
      } catch (e) {
        // 如果解析失敗，保持原始字串值
        console.warn(`Failed to parse JSON for setting ${setting.key}:`, e)
      }
      break
    case 'string':
    default:
      processedValue = String(setting.value)
      break
  }

  return {
    ...setting,
    value: processedValue
  }
}