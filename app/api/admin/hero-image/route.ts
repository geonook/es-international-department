/**
 * Hero Image Management API for KCISLK ESID Info Hub
 * 主視覺圖片管理 API - 管理員專用
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/fileUpload'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/hero-image
 * 獲取當前主視覺圖片設定
 */
export async function GET(request: NextRequest) {
  try {
    // 檢查認證
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 獲取請求參數
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'teacher'
    const settingKey = type === 'parent' ? 'parent_hero_image_url' : 'teacher_hero_image_url'

    // 獲取主視覺圖片設定
    const heroImageSetting = await prisma.systemSetting.findUnique({
      where: { key: settingKey },
      include: { updater: true }
    })

    if (!heroImageSetting) {
      return NextResponse.json(
        { error: 'Hero image setting not found' },
        { status: 404 }
      )
    }

    // 獲取相關設定
    const uploadEnabled = await prisma.systemSetting.findUnique({
      where: { key: 'hero_image_upload_enabled' }
    })

    const maxSize = await prisma.systemSetting.findUnique({
      where: { key: 'hero_image_max_size' }
    })

    const allowedTypes = await prisma.systemSetting.findUnique({
      where: { key: 'hero_image_allowed_types' }
    })

    return NextResponse.json({
      success: true,
      data: {
        currentImage: {
          url: heroImageSetting.value,
          updatedAt: heroImageSetting.updatedAt,
          updatedBy: heroImageSetting.updater
        },
        config: {
          uploadEnabled: uploadEnabled?.value === 'true',
          maxSize: maxSize ? parseInt(maxSize.value) : 5242880,
          allowedTypes: allowedTypes?.value.split(',') || ['jpg', 'jpeg', 'png', 'webp']
        }
      }
    })

  } catch (error) {
    console.error('Hero Image API GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/hero-image
 * 上傳新的主視覺圖片
 */
export async function POST(request: NextRequest) {
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

    // 檢查上傳是否啟用
    const uploadEnabledSetting = await prisma.systemSetting.findUnique({
      where: { key: 'hero_image_upload_enabled' }
    })

    if (uploadEnabledSetting?.value !== 'true') {
      return NextResponse.json(
        { error: 'Hero image upload is disabled' },
        { status: 403 }
      )
    }

    // 解析表單資料
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'teacher'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // 獲取檔案大小和類型限制
    const maxSizeSetting = await prisma.systemSetting.findUnique({
      where: { key: 'hero_image_max_size' }
    })
    const allowedTypesSetting = await prisma.systemSetting.findUnique({
      where: { key: 'hero_image_allowed_types' }
    })

    const maxSize = maxSizeSetting ? parseInt(maxSizeSetting.value) : 5242880
    const allowedTypes = allowedTypesSetting?.value.split(',') || ['jpg', 'jpeg', 'png', 'webp']

    // 驗證檔案大小
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // 驗證檔案類型
    const fileExtension = path.extname(file.name).toLowerCase().substring(1)
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { error: `File type not allowed. Supported types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // 轉換為 Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // 確定設定鍵值和檔案前綴
    const settingKey = type === 'parent' ? 'parent_hero_image_url' : 'teacher_hero_image_url'
    const filePrefix = type === 'parent' ? 'parent-hero' : 'hero'

    // 上傳檔案
    const uploadResult = await uploadFile(buffer, `${filePrefix}-${Date.now()}.${fileExtension}`, {
      relatedType: 'hero_image',
      generateThumbnail: true,
      compressImage: true,
      allowedTypes: ['image']
    })

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Upload failed' },
        { status: 500 }
      )
    }

    // 更新系統設定
    const updatedSetting = await prisma.systemSetting.update({
      where: { key: settingKey },
      data: {
        value: uploadResult.filePath,
        updatedBy: currentUser.id
      },
      include: { updater: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: uploadResult.filePath,
        thumbnailUrl: uploadResult.thumbnailPath,
        originalName: uploadResult.originalName,
        fileSize: uploadResult.fileSize,
        updatedAt: updatedSetting.updatedAt,
        updatedBy: updatedSetting.updater
      },
      message: 'Hero image updated successfully'
    })

  } catch (error) {
    console.error('Hero Image API POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/hero-image
 * 恢復預設主視覺圖片
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

    // 解析請求體以獲取類型
    const body = await request.json().catch(() => ({}))
    const type = body.type || 'teacher'

    // 確定設定鍵值和預設圖片
    const settingKey = type === 'parent' ? 'parent_hero_image_url' : 'teacher_hero_image_url'
    const defaultImage = type === 'parent' ? '/images/parent-hero-bg.svg' : '/images/teacher-hero-bg.svg'

    // 恢復預設背景圖片
    const updatedSetting = await prisma.systemSetting.update({
      where: { key: settingKey },
      data: {
        value: defaultImage,
        updatedBy: currentUser.id
      },
      include: { updater: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: updatedSetting.value,
        updatedAt: updatedSetting.updatedAt,
        updatedBy: updatedSetting.updater
      },
      message: 'Hero image reset to default successfully'
    })

  } catch (error) {
    console.error('Hero Image API DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}