/**
 * Admin Newsletter Seeding API
 * 管理員電子報種子數據 API - 用於創建測試電子報數據
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - 創建種子電子報數據
export async function POST(request: NextRequest) {
  try {
    // 檢查是否已存在 newsletter 類型的 communication
    const existingNewsletters = await prisma.communication.findMany({
      where: { type: 'newsletter' },
      select: { id: true, title: true }
    })

    if (existingNewsletters.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Newsletter records already exist',
        existing: existingNewsletters,
        total: existingNewsletters.length
      })
    }

    // Create English newsletter test data
    const newsletterData = [
      {
        title: 'January 2025 ID Monthly Newsletter',
        content: 'This month\'s newsletter includes final exam week arrangements, winter holiday activity planning, and next semester course previews. Rich in content, parents and teachers are welcome to read online. This issue features:\n\n1. Final exam week schedule and important notes\n2. Winter holiday learning activity planning\n3. Next semester course introduction and highlights\n4. Important parent meeting resolutions\n5. Outstanding student work showcase\n\nThank you for all parents and teachers\' support and cooperation!',
        summary: 'This month\'s newsletter includes final exam week arrangements, winter holiday activity planning, and next semester course previews. Rich in content, welcome to read online.',
        type: 'newsletter',
        targetAudience: 'all',
        priority: 'high',
        status: 'published',
        isImportant: true,
        isPinned: true,
        publishedAt: new Date(),
        onlineReaderUrl: 'https://online.pubhtml5.com/vpgbz/xjrq/',
        pdfUrl: null,
        issueNumber: '2025-01'
      },
      {
        title: 'December 2024 ID Monthly Newsletter',
        content: 'December newsletter features special coverage of Christmas celebrations, year-end achievement presentations, and New Year activity previews. This issue includes:\n\n1. Christmas celebration activity review\n2. Student year-end achievement showcase\n3. New Year activity announcements\n4. Winter semester course summary\n5. Parent appreciation letter sharing\n\nMay the new year bring health and happiness to all families!',
        summary: 'December newsletter features special coverage of Christmas celebrations, year-end achievement presentations, and New Year activity previews.',
        type: 'newsletter',
        targetAudience: 'parents',
        priority: 'medium',
        status: 'published',
        isImportant: false,
        isPinned: false,
        publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        onlineReaderUrl: null,
        pdfUrl: null,
        issueNumber: '2024-12'
      },
      {
        title: 'November 2024 ID Monthly Newsletter',
        content: 'November newsletter focuses on Thanksgiving activities, parent meeting summaries, and December activity previews. Key content includes:\n\n1. Thanksgiving themed activity coverage\n2. Important parent meeting resolutions\n3. Student learning achievement sharing\n4. December important activity announcements\n5. Teacher professional development report\n\nThank you to all parents for their understanding and support of school work!',
        summary: 'November newsletter focuses on Thanksgiving activities, parent meeting summaries, and December activity previews.',
        type: 'newsletter',
        targetAudience: 'all',
        priority: 'medium',
        status: 'published',
        isImportant: false,
        isPinned: false,
        publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        onlineReaderUrl: null,
        pdfUrl: 'https://example.com/newsletter-2024-11.pdf',
        issueNumber: '2024-11'
      }
    ]

    // 逐個創建電子報記錄（createMany 不支持所有欄位）
    const createdNewsletters = []
    for (const data of newsletterData) {
      try {
        const newsletter = await prisma.communication.create({
          data: data
        })
        createdNewsletters.push(newsletter)
      } catch (error) {
        console.warn(`Failed to create newsletter "${data.title}":`, error.message)
      }
    }

    // 獲取創建的記錄
    const newsletters = await prisma.communication.findMany({
      where: { type: 'newsletter' },
      select: {
        id: true,
        title: true,
        issueNumber: true,
        status: true,
        publishedAt: true
      },
      orderBy: { publishedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      message: 'Newsletter seed data created successfully',
      created: createdNewsletters.length,
      newsletters: newsletters,
      total: newsletters.length,
      createdIds: createdNewsletters.map(n => n.id)
    })

  } catch (error) {
    console.error('Error creating newsletter seed data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create newsletter seed data',
      details: error.message
    }, { status: 500 })
  }
}

// GET - 檢查現有的 newsletter 記錄
export async function GET() {
  try {
    const newsletters = await prisma.communication.findMany({
      where: { type: 'newsletter' },
      select: {
        id: true,
        title: true,
        issueNumber: true,
        status: true,
        publishedAt: true,
        onlineReaderUrl: true,
        pdfUrl: true
      },
      orderBy: { publishedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: newsletters,
      total: newsletters.length
    })

  } catch (error) {
    console.error('Error fetching newsletters:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch newsletters'
    }, { status: 500 })
  }
}