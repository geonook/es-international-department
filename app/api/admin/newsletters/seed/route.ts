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

    // 創建測試電子報數據
    const newsletterData = [
      {
        title: '2025年1月份 國際部月刊',
        content: '本月月刊包含期末評量週安排、寒假活動規劃、以及下學期課程預告。內容豐富，歡迎家長們線上閱讀。本期特別報導包括：\n\n1. 期末評量週時間安排與注意事項\n2. 寒假學習活動規劃\n3. 下學期課程介紹與重點\n4. 家長會議重要決議\n5. 學生優秀作品展示\n\n感謝所有家長與老師的支持與配合！',
        summary: '本月月刊包含期末評量週安排、寒假活動規劃、以及下學期課程預告。內容豐富，歡迎家長們線上閱讀。',
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
        title: '2024年12月份 國際部月刊',
        content: '十二月份月刊特別報導聖誕節慶祝活動、年終成果發表、以及新年活動預告。本期內容包括：\n\n1. 聖誕節慶祝活動回顧\n2. 學生年終成果展示\n3. 新年活動預告\n4. 冬季課程總結\n5. 家長感謝信件分享\n\n願新的一年為所有家庭帶來健康與快樂！',
        summary: '十二月份月刊特別報導聖誕節慶祝活動、年終成果發表、以及新年活動預告。',
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
        title: '2024年11月份 國際部月刊',
        content: '十一月份月刊聚焦感恩節活動、家長會議總結、以及十二月活動預告。本期重點內容：\n\n1. 感恩節主題活動報導\n2. 家長會議重要決議\n3. 學生學習成果分享\n4. 十二月重要活動預告\n5. 教師專業發展報告\n\n感謝所有家長對學校工作的理解與支持！',
        summary: '十一月份月刊聚焦感恩節活動、家長會議總結、以及十二月活動預告。',
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