/**
 * Public System Settings API for KCISLK ESID Info Hub
 * 公開系統設定 API - 僅返回標記為公開的設定
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/settings
 * 獲取公開的系統設定
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    let settings
    if (key) {
      // 獲取特定的公開設定
      settings = await prisma.systemSetting.findFirst({
        where: { 
          key,
          isPublic: true
        },
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
          { error: 'Setting not found or not public' },
          { status: 404 }
        )
      }
    } else {
      // 獲取所有公開設定
      settings = await prisma.systemSetting.findMany({
        where: { isPublic: true },
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