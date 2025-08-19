/**
 * Authentication Middleware
 * 認證中介軟體 - 保護需要登入的路由
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin, isTeacher, isOfficeMember, AUTH_ERRORS } from '@/lib/auth'

// 需要認證的路由清單
const PROTECTED_ROUTES = [
  '/admin',
  '/teachers',
  '/api/admin',
  '/api/teachers',
  '/api/users',
  '/api/events/manage',
  '/api/resources/manage',
  '/api/announcements/manage'
]

// 需要管理員權限的路由
const ADMIN_ONLY_ROUTES = [
  '/admin',
  '/api/admin',
  '/api/users',
  '/api/events/manage',
  '/api/resources/manage',
  '/api/announcements/manage'
]

// 需要教師權限的路由
const TEACHER_ROUTES = [
  '/teachers',
  '/api/teachers'
]

/**
 * 檢查路由是否需要保護
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * 檢查路由是否需要管理員權限
 */
function isAdminOnlyRoute(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * 檢查路由是否需要教師權限
 */
function isTeacherRoute(pathname: string): boolean {
  return TEACHER_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * 主要認證中介軟體函式
 */
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 跳過公共路由和靜態資源
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/' ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/resources') ||
    !isProtectedRoute(pathname)
  ) {
    return NextResponse.next()
  }

  try {
    // 獲取當前使用者
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      // 對於 API 路由返回 JSON 錯誤
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            success: false, 
            error: AUTH_ERRORS.TOKEN_REQUIRED,
            message: '需要登入才能存取此資源' 
          },
          { status: 401 }
        )
      }

      // 對於頁面路由重導向到登入頁面
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // 檢查管理員權限 (管理員或辦公室成員都可存取)
    if (isAdminOnlyRoute(pathname) && !isAdmin(currentUser) && !isOfficeMember(currentUser)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            success: false, 
            error: AUTH_ERRORS.ACCESS_DENIED,
            message: '需要管理員或辦公室成員權限才能存取此資源' 
          },
          { status: 403 }
        )
      }

      // 重導向到無權限頁面或首頁
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // 檢查教師權限
    if (isTeacherRoute(pathname) && !isTeacher(currentUser) && !isAdmin(currentUser)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            success: false, 
            error: AUTH_ERRORS.ACCESS_DENIED,
            message: '需要教師權限才能存取此資源' 
          },
          { status: 403 }
        )
      }

      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // 在請求標頭中加入使用者資訊
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', currentUser.id)
    requestHeaders.set('x-user-email', currentUser.email)
    requestHeaders.set('x-user-roles', JSON.stringify(currentUser.roles))

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('Auth Middleware Error:', error)

    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication error',
          message: '認證過程發生錯誤' 
        },
        { status: 500 }
      )
    }

    return NextResponse.redirect(new URL('/error', request.url))
  }
}

/**
 * API 專用認證檢查函式
 */
export async function requireAuth(request: NextRequest) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return NextResponse.json(
      { 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: '需要登入才能存取此資源' 
      },
      { status: 401 }
    )
  }

  return currentUser
}

/**
 * 管理員權限檢查函式 (管理員或辦公室成員都可存取)
 */
export async function requireAdmin(request: NextRequest) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return NextResponse.json(
      { 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: '需要登入才能存取此資源' 
      },
      { status: 401 }
    )
  }

  if (!isAdmin(currentUser) && !isOfficeMember(currentUser)) {
    return NextResponse.json(
      { 
        success: false, 
        error: AUTH_ERRORS.ACCESS_DENIED,
        message: '需要管理員或辦公室成員權限才能存取此資源' 
      },
      { status: 403 }
    )
  }

  return currentUser
}

/**
 * 教師權限檢查函式
 */
export async function requireTeacher(request: NextRequest) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return NextResponse.json(
      { 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: '需要登入才能存取此資源' 
      },
      { status: 401 }
    )
  }

  if (!isTeacher(currentUser) && !isAdmin(currentUser)) {
    return NextResponse.json(
      { 
        success: false, 
        error: AUTH_ERRORS.ACCESS_DENIED,
        message: '需要教師權限才能存取此資源' 
      },
      { status: 403 }
    )
  }

  return currentUser
}