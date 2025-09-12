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
    console.log('📢 GET /api/public/messages - 獲取公共訊息')

    // 獲取查詢參數
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    const page = parseInt(searchParams.get('page') || '1')
    const targetAudience = searchParams.get('audience') || 'all'
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit

    // 臨時強制使用硬編碼資料 - 緊急修復
    const isProduction = process.env.NODE_ENV === 'production'
    const forceHardcoded = true  // 臨時強制啟用
    
    if (isProduction || forceHardcoded) {
      console.log('🏭 Production mode: Using hardcoded messages data')
      
      const hardcodedMessages = [
        {
          id: 1,
          title: "English Textbooks Return & eBook Purchase 英語教材退書 & 電子書加購",
          content: "如果您選擇不用學校提供的教材（例如已經自行購買 myView或New Cornerstone等主教材），請於 9月5日（五）前，將書本交還給您孩子的外籍教師(IT)。\n\n📌 請一年級家長 特別注意:\nmyView 1.1 與 1.2：請交還給外籍英語教師(IT)。\nmyView 1.3：請交還給中籍英語教師(LT)。\n\n⚠️ 注意事項：\n書本必須保持全新狀態，不得有筆跡、姓名貼紙或任何使用痕跡。\n老師會連同學生的學號、姓名與班級一併登記退書。\n國際處將統一與書商辦理退書事宜。\n\n👉 建議您於聯絡簿上留言，讓中外師能夠同步掌握訊息。\n\n💻 114 學年度 myView / myPerspectives 線上帳號（電子書）加購公告\n本次電子書帳號加購為自願參加，僅供康橋國際學校學生使用，不另對外販售。\n訂購時間：即日起至 2025/9/30（二） 止\n使用期限：自開通日起至 2026/8/31 止\n訂購網址：https://reurl.cc/XE8RxR\n\n---\n\nDear Parents,\nIf you decide not to use the school-issued English textbooks (for example, if you have already purchased myView or New Cornerstone), please return them to your child's International teacher(IT) by Friday, September 5.\n\n📌 Notice for Grade 1 parents:\nmyView 1.1 and 1.2: Please return to the international teacher(IT).\nmyView 1.3: Please return to the local teacher(LT).\n\n⚠️ Reminders:\nBooks must remain in brand-new condition, with no writing, name stickers, or any signs of use.\nTeachers will record the return together with the student's ID, name, and class.\nThe ID Office will arrange the return with the publisher.\n\n👉 We recommend leaving a note in the communication book, so both local and international teachers are informed.\n\n💻 myView / myPerspectives eBook Purchase\nThe purchase of eBook accounts is optional and available exclusively for Kang Chiao students.\nOrder period: From now until Tue., September 30, 2025\nValidity: From the activation date until August 31, 2026\nOrder link: https://reurl.cc/XE8RxR",
          summary: "英語教材退書須於9月5日前辦理，電子書加購至9/30截止。Grade 1 parents please note different return procedures for myView series.",
          type: "announcement",
          priority: "high",
          isImportant: true,
          isPinned: true,
          publishedAt: new Date('2024-08-25T09:00:00Z'),
          createdAt: new Date('2024-08-25T09:00:00Z'),
          author: {
            id: 'id_office',
            displayName: '國際處 ID Office',
            firstName: '國際處',
            lastName: 'ID Office'
          },
          targetAudience: 'all'
        }
      ]

      // 應用篩選條件
      let filteredMessages = hardcodedMessages

      // 搜尋篩選
      if (search && search.trim()) {
        const searchTerm = search.trim().toLowerCase()
        filteredMessages = filteredMessages.filter(msg => 
          msg.title.toLowerCase().includes(searchTerm) ||
          msg.content.toLowerCase().includes(searchTerm) ||
          msg.summary.toLowerCase().includes(searchTerm)
        )
      }

      // 受眾篩選
      if (targetAudience !== 'all') {
        filteredMessages = filteredMessages.filter(msg => 
          msg.targetAudience === 'all' || msg.targetAudience === targetAudience
        )
      }

      // 優先級篩選
      if (priority && priority !== 'all') {
        filteredMessages = filteredMessages.filter(msg => msg.priority === priority)
      }

      // 分頁處理
      const totalCount = filteredMessages.length
      const paginatedMessages = filteredMessages.slice(skip, skip + limit)

      // 格式化回應數據
      const formattedMessages = paginatedMessages.map(msg => ({
        id: msg.id,
        title: msg.title,
        content: msg.content,
        contentPreview: msg.summary || msg.content.substring(0, 200) + '...',
        type: msg.type,
        priority: msg.priority,
        isImportant: msg.isImportant,
        isPinned: msg.isPinned,
        publishedAt: msg.publishedAt,
        createdAt: msg.createdAt,
        author: msg.author,
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
    }

    // Development/Staging 環境使用資料庫查詢
    console.log('🧪 Development/Staging mode: Using database query')

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
      content: msg.content, // 返回完整內容
      contentPreview: msg.summary || msg.content.substring(0, 200) + '...', // 預覽內容
      type: msg.type || 'announcement',
      priority: msg.priority,
      isImportant: msg.isImportant || msg.priority === 'high',
      isPinned: msg.isPinned || false,
      publishedAt: msg.publishedAt,
      createdAt: msg.createdAt,
      author: msg.author, // 返回完整 author 對象
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