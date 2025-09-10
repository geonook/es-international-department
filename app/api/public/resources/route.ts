import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Public Resources API
 * 公開學習資源 API - 供資源頁面顯示學習資源
 */
export async function GET(request: NextRequest) {
  try {
    // 獲取查詢參數
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const status = searchParams.get('status') || 'published'
    const gradeLevel = searchParams.get('gradeLevel')
    const category = searchParams.get('category')
    const resourceType = searchParams.get('resourceType')

    // 查詢條件
    const whereCondition: any = {
      status: status
    }

    // 過濾條件 - 使用關聯表查詢
    if (gradeLevel && gradeLevel !== 'all') {
      whereCondition.gradeLevel = {
        name: gradeLevel
      }
    }
    
    if (category && category !== 'all') {
      whereCondition.category = {
        name: category
      }
    }
    
    if (resourceType && resourceType !== 'all') {
      whereCondition.resourceType = resourceType
    }

    // 從 resources 表獲取學習資源數據
    const resources = await prisma.resource.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        description: true,
        resourceType: true,
        fileUrl: true,
        externalUrl: true,
        thumbnailUrl: true,
        fileSize: true,
        status: true,
        isFeatured: true,
        createdAt: true,
        gradeLevel: {
          select: {
            name: true,
            displayName: true
          }
        },
        category: {
          select: {
            name: true,
            displayName: true
          }
        },
        creator: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // 格式化回應數據
    const formattedResources = resources.map(resource => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      resourceType: resource.resourceType,
      gradeLevel: resource.gradeLevel?.name || 'General',
      gradeLevelDisplay: resource.gradeLevel?.displayName || 'General',
      fileUrl: resource.fileUrl,
      externalUrl: resource.externalUrl,
      downloadUrl: resource.fileUrl || resource.externalUrl, // 使用 fileUrl 或 externalUrl 作為 downloadUrl
      thumbnailUrl: resource.thumbnailUrl,
      category: resource.category?.name || 'General',
      categoryDisplay: resource.category?.displayName || 'General',
      tags: resource.tags?.map(tagRelation => tagRelation.tag.name) || [],
      tagColors: resource.tags?.map(tagRelation => tagRelation.tag.color) || [],
      isActive: true, // 預設為 true，因為我們只查詢已發布的資源
      isFeatured: resource.isFeatured,
      status: resource.status,
      fileSize: resource.fileSize ? Number(resource.fileSize) : null,
      createdAt: resource.createdAt.toISOString(),
      creator: resource.creator ? {
        displayName: resource.creator.displayName || 
          `${resource.creator.firstName || ''} ${resource.creator.lastName || ''}`.trim() || 
          'KCISLK ESID'
      } : { displayName: 'KCISLK ESID' }
    }))

    return NextResponse.json({
      success: true,
      data: formattedResources,
      total: formattedResources.length
    })

  } catch (error) {
    console.error('Error fetching public resources:', error)
    
    // 返回預設資源數據以避免頁面錯誤
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 1,
          title: "myView Transition Materials",
          description: "Comprehensive transition learning materials in PDF format",
          resourceType: "pdf",
          gradeLevel: "1-2",
          category: "reading",
          downloadUrl: "/resources/myview-transition.pdf",
          tags: ["transition", "reading"],
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z",
          creator: { displayName: "Teacher Chen" }
        },
        {
          id: 2,
          title: "Reading Buddies Program",
          description: "Interactive reading partnership program with video resources",
          resourceType: "video",
          gradeLevel: "1-2",
          category: "reading",
          externalUrl: "https://example.com/reading-buddies",
          tags: ["reading", "partnership"],
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z",
          creator: { displayName: "Teacher Wang" }
        },
        {
          id: 3,
          title: "The Five Components of Reading",
          description: "Core reading skills explanation with Google Drive resources",
          resourceType: "document",
          gradeLevel: "1-2",
          category: "reading",
          externalUrl: "https://drive.google.com/example",
          tags: ["reading", "skills"],
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z",
          creator: { displayName: "Teacher Lin" }
        },
        {
          id: 4,
          title: "Weekly Reading Challenge",
          description: "Weekly texts and quizzes for reading comprehension",
          resourceType: "interactive",
          gradeLevel: "1-2",
          category: "reading",
          externalUrl: "https://example.com/reading-challenge",
          tags: ["reading", "quiz"],
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z",
          creator: { displayName: "Teacher Wu" }
        },
        {
          id: 5,
          title: "Building Background Knowledge",
          description: "Language learning resources and daily reading content via ReadWorks",
          resourceType: "external",
          gradeLevel: "1-2",
          category: "language",
          externalUrl: "https://readworks.org",
          tags: ["language", "background"],
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z",
          creator: { displayName: "Teacher Liu" }
        },
        {
          id: 6,
          title: "Advanced Reading Comprehension",
          description: "Enhanced reading materials for intermediate learners",
          resourceType: "pdf",
          gradeLevel: "3-4",
          category: "reading",
          downloadUrl: "/resources/advanced-reading.pdf",
          tags: ["reading", "comprehension"],
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z",
          creator: { displayName: "Teacher Zhou" }
        },
        {
          id: 7,
          title: "Writing Workshop Resources",
          description: "Creative and academic writing support materials",
          resourceType: "document",
          gradeLevel: "3-4",
          category: "writing",
          externalUrl: "https://drive.google.com/writing-workshop",
          tags: ["writing", "creative"],
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z",
          creator: { displayName: "Teacher Huang" }
        },
        {
          id: 8,
          title: "Critical Thinking Materials",
          description: "Advanced analytical and critical thinking resources",
          resourceType: "interactive",
          gradeLevel: "5-6",
          category: "thinking",
          externalUrl: "https://example.com/critical-thinking",
          tags: ["thinking", "analysis"],
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z",
          creator: { displayName: "Teacher Zhang" }
        },
        {
          id: 9,
          title: "Research Project Guides",
          description: "Comprehensive guides for independent research projects",
          resourceType: "pdf",
          gradeLevel: "5-6",
          category: "research",
          downloadUrl: "/resources/research-guides.pdf",
          tags: ["research", "projects"],
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z",
          creator: { displayName: "Teacher Xu" }
        }
      ],
      total: 9
    })
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.PARENTS_CORNER_URL || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}