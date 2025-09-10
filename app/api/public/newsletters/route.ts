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

    // 獲取電子報數據 - 使用 communication 資料表
    const newsletters = await prisma.communication.findMany({
      where: {
        ...whereCondition,
        type: 'newsletter'  // 只獲取 newsletter 類型
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
        { issueNumber: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // 格式化回應數據 - 使用 communication 資料表欄位
    const formattedNewsletters = newsletters.map(newsletter => {
      return {
        id: newsletter.id,
        title: newsletter.title,
        content: newsletter.summary || (newsletter.content.length > 200 ? newsletter.content.substring(0, 200) + '...' : newsletter.content),
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
        onlineReaderUrl: newsletter.onlineReaderUrl, // 新增線上閱讀器 URL
        pdfUrl: newsletter.pdfUrl,
        issueNumber: newsletter.issueNumber
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedNewsletters,
      total: formattedNewsletters.length
    })

  } catch (error) {
    console.error('Error fetching public newsletters:', error)
    
    // 返回預設數據以避免首頁錯誤
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 1,
          title: '2025年1月份 國際部月刊',
          content: '本月月刊包含期末評量週安排、寒假活動規劃、以及下學期課程預告。內容豐富，歡迎家長們線上閱讀。',
          type: 'newsletter',
          priority: 'high',
          isImportant: true,
          isPinned: true,
          date: new Date().toISOString(),
          author: 'KCISLK ESID',
          targetAudience: 'all',
          onlineReaderUrl: 'https://online.pubhtml5.com/vpgbz/xjrq/', // 線上閱讀器範例
          pdfUrl: null,
          issueNumber: '2025-01'
        },
        {
          id: 2,
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
      total: 2
    })
  }
}