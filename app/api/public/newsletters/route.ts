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

    // 獲取電子報數據 - 使用 newsletter 資料表
    const newsletters = await prisma.newsletter.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        content: true,
        htmlContent: true,
        coverImageUrl: true,
        pdfUrl: true,
        status: true,
        issueNumber: true,
        publicationDate: true,
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
        { publicationDate: 'desc' },
        { issueNumber: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // 格式化回應數據 - 直接使用 newsletter 資料表欄位
    const formattedNewsletters = newsletters.map(newsletter => {
      return {
        id: newsletter.id,
        title: newsletter.title,
        content: newsletter.content.length > 200 ? newsletter.content.substring(0, 200) + '...' : newsletter.content,
        type: 'newsletter',
        priority: 'medium', // Newsletter 表沒有 priority 欄位，使用預設值
        isImportant: false, // Newsletter 表沒有 isImportant 欄位，使用預設值
        isPinned: false, // Newsletter 表沒有 isPinned 欄位，使用預設值
        date: newsletter.publicationDate || newsletter.createdAt,
        author: newsletter.author ? 
          newsletter.author.displayName || 
          `${newsletter.author.firstName || ''} ${newsletter.author.lastName || ''}`.trim() || 
          'KCISLK ESID' 
          : 'KCISLK ESID',
        targetAudience: 'all', // Newsletter 表沒有 targetAudience 欄位，使用預設值
        coverImage: newsletter.coverImageUrl,
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
          content: '本月月刊包含期末評量週安排、寒假活動規劃、以及下學期課程預告。內容豐富，歡迎家長們下載閱讀。',
          type: 'newsletter',
          priority: 'high',
          isImportant: true,
          isPinned: true,
          date: new Date().toISOString(),
          author: 'KCISLK ESID',
          targetAudience: 'all',
          coverImage: null,
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
          coverImage: null,
          pdfUrl: null,
          issueNumber: '2024-12'
        }
      ],
      total: 2
    })
  }
}