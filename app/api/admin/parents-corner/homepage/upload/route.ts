/**
 * Parents' Corner Homepage Image Upload API
 * 首頁圖片上傳 API - 管理員專用
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 檢查用戶權限
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // 解析表單數據
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!['hero', 'content'].includes(type)) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
    }

    // 驗證文件類型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // 驗證文件大小 (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // 創建上傳目錄
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'homepage')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const extension = path.extname(file.name)
    const filename = `${type}-${timestamp}${extension}`
    const filepath = path.join(uploadDir, filename)

    // 保存文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // 生成公開訪問路径
    const publicUrl = `/uploads/homepage/${filename}`

    // 更新資料庫設定
    const settingKey = type === 'hero' ? 'homepage_hero_image' : 'homepage_content_image'
    await prisma.systemSettings.upsert({
      where: { key: settingKey },
      update: { 
        value: publicUrl,
        updatedBy: session.user.id
      },
      create: {
        key: settingKey,
        value: publicUrl,
        category: 'homepage',
        description: `Homepage ${type} image`,
        updatedBy: session.user.id
      }
    })

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: `${type === 'hero' ? 'Hero' : 'Content'} image uploaded successfully`
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}