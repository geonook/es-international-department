/**
 * Newsletter Archive API
 * 電子報歷史檔案 API - 提供月份/年份瀏覽功能
 * 
 * Returns available months/years with newsletter counts for archive navigation
 * 返回可用的月份/年份及電子報數量，供歷史檔案導覽使用
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface MonthlyArchive {
  month: string      // Format: YYYY-MM
  year: number
  count: number
  newsletters: Array<{
    id: number
    title: string
    issueNumber?: string
    publishedAt: Date | string
    hasOnlineReader: boolean
    onlineReaderUrl?: string
    pdfUrl?: string
  }>
  hasOnlineReader: boolean
}

interface YearlyArchive {
  year: number
  count: number
  months: MonthlyArchive[]
}

// GET - 獲取電子報歷史檔案統計
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupBy = searchParams.get('groupBy') || 'month' // 'month' | 'year' | 'both'
    const limit = parseInt(searchParams.get('limit') || '12') // 限制返回的月份數
    const includeEmpty = searchParams.get('includeEmpty') === 'true' // 是否包含沒有電子報的月份
    
    console.log('Newsletter Archive API called with params:', {
      groupBy,
      limit,
      includeEmpty
    })

    // 獲取所有已發布的電子報，按發布日期排序
    const newsletters = await prisma.communication.findMany({
      where: {
        status: 'published',
        type: 'newsletter'
      },
      select: {
        id: true,
        title: true,
        issueNumber: true,
        publishedAt: true,
        createdAt: true,
        onlineReaderUrl: true,
        pdfUrl: true
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    console.log(`Found ${newsletters.length} published newsletters`)

    // 如果沒有電子報，返回空結果
    if (newsletters.length === 0) {
      return NextResponse.json({
        success: true,
        archive: [],
        availableYears: [],
        availableMonths: [],
        totalNewsletters: 0,
        groupBy: groupBy,
        message: 'No newsletters found in archive'
      })
    }

    // 按月份分組電子報
    const monthlyGroups = new Map<string, {
      month: string
      year: number
      newsletters: typeof newsletters
    }>()

    newsletters.forEach(newsletter => {
      const date = newsletter.publishedAt || newsletter.createdAt
      if (!date) return

      const d = new Date(date)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyGroups.has(monthKey)) {
        monthlyGroups.set(monthKey, {
          month: monthKey,
          year: d.getFullYear(),
          newsletters: []
        })
      }
      
      monthlyGroups.get(monthKey)!.newsletters.push(newsletter)
    })

    console.log(`Grouped newsletters into ${monthlyGroups.size} months`)

    // 建立月份檔案資料
    const monthlyArchives: MonthlyArchive[] = Array.from(monthlyGroups.entries())
      .map(([monthKey, group]) => ({
        month: monthKey,
        year: group.year,
        count: group.newsletters.length,
        newsletters: group.newsletters.map(n => ({
          id: n.id,
          title: n.title,
          issueNumber: n.issueNumber || undefined,
          publishedAt: n.publishedAt || n.createdAt,
          hasOnlineReader: Boolean(n.onlineReaderUrl),
          onlineReaderUrl: n.onlineReaderUrl || undefined,
          pdfUrl: n.pdfUrl || undefined
        })),
        hasOnlineReader: group.newsletters.some(n => Boolean(n.onlineReaderUrl))
      }))
      .sort((a, b) => b.month.localeCompare(a.month)) // 最新的月份在前
      .slice(0, limit) // 應用限制

    // 獲取可用年份列表
    const availableYears = [...new Set(monthlyArchives.map(archive => archive.year))]
      .sort((a, b) => b - a) // 最新年份在前

    // 獲取可用月份列表  
    const availableMonths = monthlyArchives.map(archive => archive.month)

    // 建立年份檔案資料（如果需要）
    let yearlyArchives: YearlyArchive[] = []
    if (groupBy === 'year' || groupBy === 'both') {
      const yearlyGroups = new Map<number, MonthlyArchive[]>()
      
      monthlyArchives.forEach(monthArchive => {
        if (!yearlyGroups.has(monthArchive.year)) {
          yearlyGroups.set(monthArchive.year, [])
        }
        yearlyGroups.get(monthArchive.year)!.push(monthArchive)
      })
      
      yearlyArchives = Array.from(yearlyGroups.entries())
        .map(([year, months]) => ({
          year,
          count: months.reduce((sum, month) => sum + month.count, 0),
          months: months.sort((a, b) => b.month.localeCompare(a.month)) // 最新月份在前
        }))
        .sort((a, b) => b.year - a.year) // 最新年份在前
    }

    // 計算總統計
    const totalNewsletters = newsletters.length
    const totalMonths = monthlyArchives.length
    const totalYears = availableYears.length

    // 根據 groupBy 參數返回相應的資料結構
    const responseData: any = {
      success: true,
      totalNewsletters,
      totalMonths,
      totalYears,
      availableYears,
      availableMonths,
      groupBy,
      queryParams: {
        groupBy,
        limit,
        includeEmpty
      }
    }

    if (groupBy === 'month') {
      responseData.archive = monthlyArchives
    } else if (groupBy === 'year') {
      responseData.archive = yearlyArchives
    } else if (groupBy === 'both') {
      responseData.archive = {
        byMonth: monthlyArchives,
        byYear: yearlyArchives
      }
    }

    console.log('Archive API response prepared:', {
      totalNewsletters,
      totalMonths,
      totalYears,
      availableYears: availableYears.slice(0, 3), // 只記錄前3年
      groupBy
    })

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error fetching newsletter archive:', error)
    
    return NextResponse.json({
      success: false,
      archive: [],
      availableYears: [],
      availableMonths: [],
      totalNewsletters: 0,
      error: 'Failed to fetch newsletter archive',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      fallback: {
        archive: [
          {
            month: '2025-01',
            year: 2025,
            count: 1,
            newsletters: [
              {
                id: 'fallback-1',
                title: '2025年1月份 國際部月刊',
                issueNumber: '2025-01',
                publishedAt: new Date().toISOString(),
                hasOnlineReader: true,
                onlineReaderUrl: 'https://online.pubhtml5.com/vpgbz/xjrq/'
              }
            ],
            hasOnlineReader: true
          },
          {
            month: '2024-12',
            year: 2024,
            count: 1,
            newsletters: [
              {
                id: 'fallback-2',
                title: '2024年12月份 國際部月刊',
                issueNumber: '2024-12',
                publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                hasOnlineReader: false
              }
            ],
            hasOnlineReader: false
          }
        ],
        availableYears: [2025, 2024],
        availableMonths: ['2025-01', '2024-12'],
        totalNewsletters: 2
      }
    }, { status: 500 })
  }
}