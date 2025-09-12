/**
 * Enhanced Public Newsletter API with Date Filtering
 * 增強的公開電子報 API - 支援月份/年份篩選功能
 * 
 * Query Parameters:
 * - limit: number (default: 3) - 限制返回數量
 * - audience: string (default: 'all') - 目標受眾
 * - month: string (format: YYYY-MM) - 篩選特定月份
 * - year: string (format: YYYY) - 篩選特定年份
 * - dateRange: 'month'|'year'|'all' - 日期範圍類型
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Helper function to build date filters
function buildDateFilters(searchParams: URLSearchParams) {
  const month = searchParams.get('month') // Format: YYYY-MM
  const year = searchParams.get('year')   // Format: YYYY
  const dateRange = searchParams.get('dateRange') || 'all'
  
  if (month && month.match(/^\d{4}-\d{2}$/)) {
    // Filter by specific month
    const [yearPart, monthPart] = month.split('-')
    const startDate = new Date(parseInt(yearPart), parseInt(monthPart) - 1, 1)
    const endDate = new Date(parseInt(yearPart), parseInt(monthPart), 0, 23, 59, 59, 999)
    
    return {
      publishedAt: {
        gte: startDate,
        lte: endDate
      }
    }
  } else if (year && year.match(/^\d{4}$/)) {
    // Filter by specific year
    const startDate = new Date(parseInt(year), 0, 1)
    const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999)
    
    return {
      publishedAt: {
        gte: startDate,
        lte: endDate
      }
    }
  }
  
  // No date filter - return all
  return {}
}

// Helper function to format month/year from date
function formatMonthYear(date: Date | null | undefined): { month: string; year: number } {
  if (!date) {
    const now = new Date()
    return {
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      year: now.getFullYear()
    }
  }
  
  const d = new Date(date)
  return {
    month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    year: d.getFullYear()
  }
}

// GET - 獲取電子報內容 (支援日期篩選)
export async function GET(request: NextRequest) {
  try {
    // 獲取查詢參數
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const targetAudience = searchParams.get('audience') || 'all'
    
    // Build date filters
    const dateFilters = buildDateFilters(searchParams)

    // 查詢條件 - 結合基礎條件和日期篩選
    const whereCondition: any = {
      status: 'published',
      ...dateFilters
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
        embedCode: true,
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

    // If no newsletter type data found, try to find communications with "Newsletter" keywords
    if (newsletters.length === 0) {
      newsletters = await prisma.communication.findMany({
        where: {
          ...whereCondition,
          OR: [
            { title: { contains: 'Newsletter', mode: 'insensitive' } },
            { title: { contains: 'newsletter', mode: 'insensitive' } },
            { content: { contains: 'Newsletter', mode: 'insensitive' } },
            { content: { contains: 'monthly', mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          onlineReaderUrl: true,
          pdfUrl: true,
          embedCode: true,
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

    // 格式化回應數據 - 增加月份/年份資訊
    const formattedNewsletters = newsletters.map(newsletter => {
      const publishedDate = newsletter.publishedAt || newsletter.createdAt
      const { month, year } = formatMonthYear(publishedDate)
      
      return {
        id: newsletter.id,
        title: newsletter.title,
        content: newsletter.summary || (newsletter.content && newsletter.content.length > 200 ? newsletter.content.substring(0, 200) + '...' : newsletter.content || 'Newsletter content will be available soon.'),
        type: 'newsletter',
        priority: 'medium',
        isImportant: false,
        isPinned: false,
        date: publishedDate,
        month: month, // 新增：格式化的月份 (YYYY-MM)
        year: year,   // 新增：年份
        author: newsletter.author ? 
          newsletter.author.displayName || 
          `${newsletter.author.firstName || ''} ${newsletter.author.lastName || ''}`.trim() || 
          'KCISLK ESID' 
          : 'KCISLK ESID',
        targetAudience: 'all',
        onlineReaderUrl: newsletter.onlineReaderUrl, // 線上閱讀器 URL
        pdfUrl: newsletter.pdfUrl, // PDF 下載 URL
        embedCode: newsletter.embedCode, // 嵌入程式碼
        issueNumber: newsletter.issueNumber, // 期號
        hasOnlineReader: Boolean(newsletter.onlineReaderUrl || newsletter.embedCode) // 新增：是否有線上閱讀器或嵌入碼
      }
    })

    // 計算額外的統計資訊
    const totalCount = await prisma.communication.count({
      where: {
        status: 'published',
        type: 'newsletter'
      }
    })
    
    // 獲取查詢參數用於回應元數據
    const queryParams = {
      month: searchParams.get('month'),
      year: searchParams.get('year'),
      limit: limit,
      audience: targetAudience
    }
    
    // 如果有實際數據，返回增強的回應資料
    if (formattedNewsletters.length > 0) {
      return NextResponse.json({
        success: true,
        data: formattedNewsletters,
        total: formattedNewsletters.length,
        totalInDatabase: totalCount,
        queryParams: queryParams,
        hasDateFilter: Boolean(queryParams.month || queryParams.year),
        source: 'database'
      })
    }

    // 沒有找到數據時的回應
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      totalInDatabase: totalCount,
      queryParams: queryParams,
      hasDateFilter: Boolean(queryParams.month || queryParams.year),
      source: 'empty',
      message: queryParams.month || queryParams.year 
        ? `No newsletters found for the specified ${queryParams.month ? 'month' : 'year'}`
        : 'No newsletters available'
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
          title: 'January 2025 International Department Monthly Newsletter',
          content: 'This month\'s newsletter includes final exam week arrangements, winter holiday activity planning, and next semester course previews. Rich in content, parents and teachers are welcome to read online.',
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
          title: 'December 2024 International Department Monthly Newsletter',
          content: 'December newsletter features special coverage of Christmas celebrations, year-end achievement presentations, and New Year activity previews.',
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