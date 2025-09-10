/**
 * Public Newsletter API
 * 公開電子報 API - 供首頁顯示月刊電子報
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - 獲取最新的電子報內容
export async function GET(request: NextRequest) {
  try {
    // 獲取查詢參數
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '3')
    const targetAudience = searchParams.get('audience') || 'all'

    // 查詢條件 - 僅使用 newsletter 表中存在的欄位
    const whereCondition: any = {
      status: 'published'
    }

    // 獲取電子報數據 - 使用 communication 資料表，查詢 newsletter 類型
    // 如果沒有 newsletter 類型數據，查詢可能包含電子報內容的其他類型
    let newsletters = await prisma.communication.findMany({
      where: {
        ...whereCondition,
        type: 'newsletter'  // 優先獲取 newsletter 類型
      },
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        onlineReaderUrl: true,
        pdfUrl: true,
        issueNumber: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // 如果沒有找到 newsletter 類型的數據，嘗試查詢包含 "月刊" 或 "Newsletter" 字樣的公告
    if (newsletters.length === 0) {
      newsletters = await prisma.communication.findMany({
        where: {
          ...whereCondition,
          OR: [
            { title: { contains: '月刊', mode: 'insensitive' } },
            { title: { contains: 'Newsletter', mode: 'insensitive' } },
            { title: { contains: 'newsletter', mode: 'insensitive' } },
            { content: { contains: '月刊', mode: 'insensitive' } },
            { content: { contains: 'Newsletter', mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          onlineReaderUrl: true,
          pdfUrl: true,
          issueNumber: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      })
    }

    // 格式化回應數據 - 使用 communication 資料表欄位
    const formattedNewsletters = newsletters.map(newsletter => {
      return {
        id: newsletter.id,
        title: newsletter.title,
        content: newsletter.summary || (newsletter.content && newsletter.content.length > 200 ? newsletter.content.substring(0, 200) + '...' : newsletter.content || 'Newsletter content will be available soon.'),
        type: 'newsletter',
        priority: 'medium',
        isImportant: false,
        isPinned: false,
        date: newsletter.publishedAt || newsletter.createdAt,
        author: newsletter.author ? 
          newsletter.author.displayName || 
          `${newsletter.author.firstName || ''} ${newsletter.author.lastName || ''}`.trim() || 
          'KCISLK ESID' 
          : 'KCISLK ESID',
        targetAudience: 'all',
        onlineReaderUrl: newsletter.onlineReaderUrl, // 線上閱讀器 URL
        pdfUrl: newsletter.pdfUrl, // PDF 下載 URL
        issueNumber: newsletter.issueNumber // 期號
      }
    })

    // 如果有實際數據，返回實際數據；否則返回預設數據
    if (formattedNewsletters.length > 0) {
      return NextResponse.json({
        success: true,
        data: formattedNewsletters,
        total: formattedNewsletters.length,
        source: 'database'
      })
    }

    // 不應該再執行到這裡，因為上面已經處理了所有情況
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      source: 'empty'
    })

  } catch (error) {
    console.error('Error fetching public newsletters:', error)
    console.error('Error details:', error.message)
    
    // 返回錯誤回應，讓前端顯示適當的錯誤訊息
    return NextResponse.json({
      success: false,
      data: [],
      total: 0,
      error: 'Failed to fetch newsletters',
      fallback: [
        {
          id: 'fallback-1',
          title: '2025年1月份 國際部月刊',
          content: '本月月刊包含期末評量週安排、寒假活動規劃、以及下學期課程預告。內容豐富，歡迎家長們線上閱讀。',
          type: 'newsletter',
          priority: 'high',
          isImportant: true,
          isPinned: true,
          date: new Date().toISOString(),
          author: 'KCISLK ESID',
          targetAudience: 'all',
          onlineReaderUrl: 'https://online.pubhtml5.com/vpgbz/xjrq/',
          pdfUrl: null,
          issueNumber: '2025-01'
        },
        {
          id: 'fallback-2',
          title: '2024年12月份 國際部月刊',
          content: '十二月份月刊特別報導聖誕節慶祝活動、年終成果發表、以及新年活動預告。',
          type: 'newsletter',
          priority: 'medium',
          isImportant: false,
          isPinned: false,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          author: 'KCISLK ESID',
          targetAudience: 'parents',
          onlineReaderUrl: null,
          pdfUrl: null,
          issueNumber: '2024-12'
        }
      ],
      source: 'fallback'
    })
  }
}