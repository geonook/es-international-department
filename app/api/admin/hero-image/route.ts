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

    // 獲取主視覺圖片設定
    const heroImageSetting = await prisma.systemSetting.findUnique({
      where: { key: 'teacher_hero_image_url' },
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

    // 上傳檔案
    const uploadResult = await uploadFile(buffer, `hero-${Date.now()}.${fileExtension}`, {
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
      where: { key: 'teacher_hero_image_url' },
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

    // 恢復預設背景圖片
    const updatedSetting = await prisma.systemSetting.update({
      where: { key: 'teacher_hero_image_url' },
      data: {
        value: '/images/teacher-hero-bg.svg',
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