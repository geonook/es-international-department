/**
 * Public Message Board API
 * 公開訊息板 API - 供首頁顯示最新消息
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - 獲取最新的訊息板內容
export async function GET(request: NextRequest) {
  try {
    // 獲取查詢參數
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    const page = parseInt(searchParams.get('page') || '1')
    const targetAudience = searchParams.get('audience') || 'all'
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit

    // 查詢條件
    const whereCondition: any = {
      status: 'published',
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } }
      ]
    }

    // 過濾目標受眾
    if (targetAudience !== 'all') {
      whereCondition.targetAudience = {
        in: [targetAudience, 'all']
      }
    }

    // 過濾優先級
    if (priority && priority !== 'all') {
      whereCondition.priority = priority
    }

    // 搜尋功能
    if (search && search.trim()) {
      whereCondition.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { content: { contains: search.trim(), mode: 'insensitive' } },
        { summary: { contains: search.trim(), mode: 'insensitive' } }
      ]
    }

    // 簡化架構：只獲取 announcements (Homepage Announcements from Parents' Corner)
    const [announcements, totalCount] = await Promise.all([
      prisma.communication.findMany({
        where: {
          ...whereCondition,
          type: 'announcement'  // 只使用 announcement 類型
        },
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          type: true,
          targetAudience: true,
          priority: true,
          status: true,
          isImportant: true,
          isPinned: true,
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
          { isPinned: 'desc' },
          { priority: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.communication.count({
        where: {
          ...whereCondition,
          type: 'announcement'
        }
      })
    ])

    // 簡化變數名稱
    const combinedMessages = announcements

    // 格式化回應數據
    const formattedMessages = combinedMessages.map(msg => ({
      id: msg.id,
      title: msg.title,
      content: msg.summary || msg.content.substring(0, 200) + '...',
      type: msg.type || 'announcement',
      priority: msg.priority,
      isImportant: msg.isImportant || msg.priority === 'high',
      isPinned: msg.isPinned || false,
      date: msg.publishedAt || msg.createdAt,
      author: msg.author ? 
        msg.author.displayName || 
        `${msg.author.firstName || ''} ${msg.author.lastName || ''}`.trim() || 
        'KCISLK ESID' 
        : 'KCISLK ESID',
      targetAudience: msg.targetAudience
    }))

    return NextResponse.json({
      success: true,
      data: formattedMessages,
      total: totalCount,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching public messages:', error)
    
    // 返回空數據而非預設數據，確保首頁顯示真實資料庫內容
    return NextResponse.json({
      success: false,
      data: [],
      total: 0,
      error: 'Failed to fetch messages'
    })
  }
}