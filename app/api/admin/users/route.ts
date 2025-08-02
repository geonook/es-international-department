/**
 * Admin Users Management API
 * 管理員使用者管理 API - 需要管理員權限
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/users
 * 獲取所有使用者列表 (管理員專用)
 */
export async function GET(request: NextRequest) {
  // 檢查管理員權限
  const adminUser = await requireAdmin(request)
  if (adminUser instanceof NextResponse) {
    return adminUser // 返回錯誤回應
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const role = searchParams.get('role')

    const skip = (page - 1) * limit

    // 建構查詢條件
    const whereClause: any = {
      isActive: true
    }

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 獲取使用者列表
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          displayName: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  displayName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ])

    // 格式化使用者資料
    const formattedUsers = users.map(user => ({
      ...user,
      roles: user.userRoles.map(ur => ur.role)
    }))

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        message: '獲取使用者列表失敗'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users
 * 創建新使用者 (管理員專用)
 */
export async function POST(request: NextRequest) {
  // 檢查管理員權限
  const adminUser = await requireAdmin(request)
  if (adminUser instanceof NextResponse) {
    return adminUser
  }

  try {
    const body = await request.json()
    const { email, password, firstName, lastName, displayName, phone, roles = [] } = body

    // 基本驗證
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Email 和密碼為必填欄位'
        },
        { status: 400 }
      )
    }

    // 檢查 email 是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists',
          message: '此 Email 已被使用'
        },
        { status: 400 }
      )
    }

    // 導入密碼哈希函式
    const { hashPassword } = await import('@/lib/auth')
    const passwordHash = await hashPassword(password)

    // 創建使用者
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        displayName: displayName || `${firstName} ${lastName}`.trim(),
        phone,
        emailVerified: true, // 管理員創建的帳戶預設已驗證
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    })

    // 分配角色 (如果指定)
    if (roles.length > 0) {
      const roleAssignments = roles.map((roleId: number) => ({
        userId: newUser.id,
        roleId,
        assignedBy: adminUser.id
      }))

      await prisma.userRole.createMany({
        data: roleAssignments
      })
    }

    return NextResponse.json({
      success: true,
      data: { user: newUser },
      message: '使用者創建成功'
    }, { status: 201 })

  } catch (error) {
    console.error('Admin create user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
        message: '創建使用者失敗'
      },
      { status: 500 }
    )
  }
}