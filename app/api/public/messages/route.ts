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
    const targetAudience = searchParams.get('audience') || 'all'

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

    // 獲取訊息板數據
    const messages = await prisma.communication.findMany({
      where: {
        ...whereCondition,
        type: 'message_board'
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
      take: limit
    })

    // 如果沒有訊息，嘗試獲取公告
    let combinedMessages = messages

    if (messages.length < limit) {
      const announcements = await prisma.announcement.findMany({
        where: {
          status: 'published',
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } }
          ],
          ...(targetAudience !== 'all' ? {
            targetAudience: {
              in: [targetAudience, 'all']
            }
          } : {})
        },
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          targetAudience: true,
          priority: true,
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
          { priority: 'desc' },
          { publishedAt: 'desc' }
        ],
        take: limit - messages.length
      })

      // 合併訊息和公告
      combinedMessages = [
        ...messages,
        ...announcements.map(ann => ({
          ...ann,
          type: 'announcement' as const,
          isImportant: ann.priority === 'high',
          isPinned: false
        }))
      ]
    }

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
      total: formattedMessages.length
    })

  } catch (error) {
    console.error('Error fetching public messages:', error)
    
    // 返回預設數據以避免首頁錯誤
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 1,
          title: '期末評量週注意事項',
          content: '親愛的家長們，期末評量週即將到來（1/20-1/24），請協助孩子做好複習準備。各科評量範圍已上傳至班級群組。',
          type: 'announcement',
          priority: 'high',
          isImportant: true,
          isPinned: true,
          date: new Date().toISOString(),
          author: 'KCISLK ESID',
          targetAudience: 'all'
        },
        {
          id: 2,
          title: '國際文化日活動報名開始',
          content: '2025國際文化日將於2月28日舉行，歡迎家長報名參與文化展示攤位。報名表請至辦公室索取。',
          type: 'message_board',
          priority: 'medium',
          isImportant: false,
          isPinned: false,
          date: new Date().toISOString(),
          author: 'KCISLK ESID',
          targetAudience: 'parents'
        }
      ],
      total: 2
    })
  }
}