/**
 * Parents' Corner Homepage Image Upload API
 * 首頁圖片上傳 API - 管理員專用
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting homepage image upload...')
    
    const adminUser = await requireAdmin(request)
    if (adminUser instanceof NextResponse) {
      console.log('❌ Admin authentication failed')
      return adminUser
    }

    console.log(`✅ Admin authenticated: ${adminUser.email} (${adminUser.id})`)

    // 解析表單數據
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    console.log(`📁 Upload request: type=${type}, file=${file?.name}, size=${file?.size}`)

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!['hero', 'content'].includes(type)) {
      console.log(`❌ Invalid type: ${type}`)
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
    }

    // 驗證文件類型
    if (!file.type.startsWith('image/')) {
      console.log(`❌ Invalid file type: ${file.type}`)
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // 驗證文件大小 (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log(`❌ File too large: ${file.size} bytes`)
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // 創建上傳目錄
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'homepage')
    if (!existsSync(uploadDir)) {
      console.log(`📁 Creating upload directory: ${uploadDir}`)
      await mkdir(uploadDir, { recursive: true })
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const extension = path.extname(file.name)
    const filename = `${type}-${timestamp}${extension}`
    const filepath = path.join(uploadDir, filename)

    console.log(`💾 Saving file to: ${filepath}`)

    // 保存文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // 生成公開訪問路径
    const publicUrl = `/uploads/homepage/${filename}`

    console.log(`🔗 Public URL: ${publicUrl}`)

    // 更新資料庫設定
    const settingKey = type === 'hero' ? 'homepage_hero_image' : 'homepage_content_image'
    
    console.log(`💾 Updating database setting: ${settingKey}`)
    
    try {
      await prisma.systemSetting.upsert({
        where: { key: settingKey },
        update: { 
          value: publicUrl,
          updatedBy: adminUser.id
        },
        create: {
          key: settingKey,
          value: publicUrl,
          category: 'homepage',
          description: `Homepage ${type} image`,
          updatedBy: adminUser.id
        }
      })
      
      console.log(`✅ Database setting updated successfully`)
    } catch (dbError) {
      console.error('❌ Database update failed:', dbError)
      throw dbError
    }

    console.log(`🎉 Upload completed successfully`)

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: `${type === 'hero' ? 'Hero' : 'Content'} image uploaded successfully`
    })

  } catch (error) {
    console.error('💥 Upload error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}