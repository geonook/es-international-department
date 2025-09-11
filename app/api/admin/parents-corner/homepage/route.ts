/**
 * Parents' Corner Homepage API
 * 首頁設定 API - 管理員專用
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

interface HomepageSettings {
  heroImage?: string
  contentImage?: string
  mainTitle: string
  subtitle: string
  quoteText: string
  quoteAuthor: string
  exploreButtonText: string
  exploreButtonLink: string
  learnMoreButtonText: string
  learnMoreButtonLink: string
}

// GET - 獲取首頁設定
export async function GET(request: NextRequest) {
  try {
    // 使用 requireAdminAuth 進行認證
    const authResult = await requireAdminAuth(request)
    if (!authResult.success || !authResult.user) {
      return authResult.response || NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // 獲取首頁設定
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'homepage_hero_image',
            'homepage_content_image',
            'homepage_main_title',
            'homepage_subtitle',
            'homepage_quote_text',
            'homepage_quote_author',
            'homepage_explore_button_text',
            'homepage_explore_button_link',
            'homepage_learn_button_text',
            'homepage_learn_button_link'
          ]
        }
      }
    })

    // 轉換為前端格式
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    const response: HomepageSettings = {
      heroImage: settingsMap.homepage_hero_image,
      contentImage: settingsMap.homepage_content_image,
      mainTitle: settingsMap.homepage_main_title || 'Welcome to our Parents\' Corner',
      subtitle: settingsMap.homepage_subtitle || 'Your dedicated family hub for school updates, events, and communication with your child\'s learning journey',
      quoteText: settingsMap.homepage_quote_text || 'Parents are the cornerstone of a child\'s education; their support and collaboration with teachers create a powerful partnership that inspires and nurtures lifelong learners.',
      quoteAuthor: settingsMap.homepage_quote_author || '',
      exploreButtonText: settingsMap.homepage_explore_button_text || 'Explore Resources',
      exploreButtonLink: settingsMap.homepage_explore_button_link || '/resources',
      learnMoreButtonText: settingsMap.homepage_learn_button_text || 'Learn More',
      learnMoreButtonLink: settingsMap.homepage_learn_button_link || '/events'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching homepage settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - 更新首頁設定
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Starting homepage settings update...')
    
    // 使用 requireAdminAuth 進行認證
    const authResult = await requireAdminAuth(request)
    if (!authResult.success || !authResult.user) {
      console.log('❌ Admin authentication failed for settings update')
      return authResult.response || NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    const adminUser = authResult.user
    console.log(`✅ Admin authenticated for settings update: ${adminUser.email} (${adminUser.id})`)

    const data: HomepageSettings = await request.json()
    console.log('📝 Settings to update:', {
      mainTitle: data.mainTitle?.substring(0, 50),
      subtitle: data.subtitle?.substring(0, 50),
      quoteText: data.quoteText?.substring(0, 50),
      heroImage: data.heroImage,
      contentImage: data.contentImage
    })

    // 設定映射
    const settingsToUpdate = [
      { key: 'homepage_main_title', value: data.mainTitle },
      { key: 'homepage_subtitle', value: data.subtitle },
      { key: 'homepage_quote_text', value: data.quoteText },
      { key: 'homepage_quote_author', value: data.quoteAuthor },
      { key: 'homepage_explore_button_text', value: data.exploreButtonText },
      { key: 'homepage_explore_button_link', value: data.exploreButtonLink },
      { key: 'homepage_learn_button_text', value: data.learnMoreButtonText },
      { key: 'homepage_learn_button_link', value: data.learnMoreButtonLink }
    ]

    // 如果有圖片設定也更新
    if (data.heroImage !== undefined) {
      settingsToUpdate.push({ key: 'homepage_hero_image', value: data.heroImage })
    }
    if (data.contentImage !== undefined) {
      settingsToUpdate.push({ key: 'homepage_content_image', value: data.contentImage })
    }

    console.log(`💾 Updating ${settingsToUpdate.length} settings in database...`)

    // 批量更新設定
    try {
      await Promise.all(
        settingsToUpdate.map(async (setting) => {
          console.log(`🔄 Updating setting: ${setting.key}`)
          return prisma.systemSetting.upsert({
            where: { key: setting.key },
            update: { 
              value: setting.value,
              updatedBy: adminUser.id
            },
            create: {
              key: setting.key,
              value: setting.value,
              description: `Homepage setting: ${setting.key}`,
              dataType: 'string',
              isPublic: false,
              updatedBy: adminUser.id
            }
          })
        })
      )
      
      console.log(`✅ All ${settingsToUpdate.length} settings updated successfully`)
    } catch (dbError) {
      console.error('❌ Database batch update failed:', dbError)
      throw dbError
    }

    console.log('🎉 Homepage settings update completed successfully')

    return NextResponse.json({ success: true, message: 'Homepage settings updated successfully' })

  } catch (error) {
    console.error('💥 Homepage settings update error:', {
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