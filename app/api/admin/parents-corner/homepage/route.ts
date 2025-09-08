/**
 * Parents' Corner Homepage API
 * 首頁設定 API - 管理員專用
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // 檢查用戶權限
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role === 'viewer') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 獲取首頁設定
    const settings = await prisma.systemSettings.findMany({
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
      quoteText: settingsMap.homepage_quote_text || 'Parents are the cornerstone of a child\'s education; their support and collaboration with teachers create',
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

    const data: HomepageSettings = await request.json()

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

    // 批量更新設定
    await Promise.all(
      settingsToUpdate.map(setting =>
        prisma.systemSettings.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: {
            key: setting.key,
            value: setting.value,
            category: 'homepage',
            description: `Homepage setting: ${setting.key}`,
            updatedBy: session.user.id
          }
        })
      )
    )

    return NextResponse.json({ success: true, message: 'Homepage settings updated successfully' })

  } catch (error) {
    console.error('Error updating homepage settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}