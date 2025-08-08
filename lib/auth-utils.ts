/**
 * Authentication Utilities for API Routes
 * API 路由專用認證工具函式
 * 
 * @description 優化的認證檢查工具，減少重複邏輯並提升效能
 * @version 1.0.0
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AUTH_ERRORS, User } from '@/lib/auth'

/**
 * API 認證結果介面
 */
export interface AuthResult {
  success: boolean
  user: User | null
  response?: NextResponse
}

/**
 * 快速 API 認證檢查（用於需要認證的 API 路由）
 * 
 * @description 統一的認證檢查邏輯，避免在每個 API 路由中重複代碼
 * @param request - Next.js 請求物件（可選，用於額外的請求資訊）
 * @returns 認證結果和錯誤回應（如果認證失敗）
 */
export async function requireApiAuth(request?: NextRequest): Promise<AuthResult> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return {
        success: false,
        user: null,
        response: NextResponse.json(
          { 
            success: false, 
            error: AUTH_ERRORS.TOKEN_REQUIRED,
            message: '需要登入才能存取此資源' 
          },
          { status: 401 }
        )
      }
    }

    return {
      success: true,
      user,
      response: undefined
    }
  } catch (error) {
    console.error('API Auth check error:', error)
    return {
      success: false,
      user: null,
      response: NextResponse.json(
        { 
          success: false, 
          error: 'AUTH_ERROR',
          message: '認證過程發生錯誤' 
        },
        { status: 500 }
      )
    }
  }
}

/**
 * 管理員權限檢查（用於需要管理員權限的 API 路由）
 * 
 * @description 檢查用戶是否具有管理員權限
 * @param request - Next.js 請求物件（可選）
 * @returns 認證結果和錯誤回應（如果權限不足）
 */
export async function requireAdminAuth(request?: NextRequest): Promise<AuthResult> {
  const authResult = await requireApiAuth(request)
  
  if (!authResult.success || !authResult.user) {
    return authResult
  }

  const user = authResult.user
  const isAdmin = user.roles.includes('admin')
  
  if (!isAdmin) {
    return {
      success: false,
      user,
      response: NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: '需要管理員權限才能存取此資源' 
        },
        { status: 403 }
      )
    }
  }

  return {
    success: true,
    user,
    response: undefined
  }
}

/**
 * 教師權限檢查（用於需要教師權限的 API 路由）
 * 
 * @description 檢查用戶是否具有教師或管理員權限
 * @param request - Next.js 請求物件（可選）
 * @returns 認證結果和錯誤回應（如果權限不足）
 */
export async function requireTeacherAuth(request?: NextRequest): Promise<AuthResult> {
  const authResult = await requireApiAuth(request)
  
  if (!authResult.success || !authResult.user) {
    return authResult
  }

  const user = authResult.user
  const hasTeacherAccess = user.roles.includes('teacher') || user.roles.includes('admin')
  
  if (!hasTeacherAccess) {
    return {
      success: false,
      user,
      response: NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: '需要教師權限才能存取此資源' 
        },
        { status: 403 }
      )
    }
  }

  return {
    success: true,
    user,
    response: undefined
  }
}

/**
 * API 錯誤回應生成器
 * 
 * @description 統一的錯誤回應格式
 * @param message - 錯誤訊息
 * @param status - HTTP 狀態碼
 * @param error - 錯誤代碼
 * @returns NextResponse 錯誤回應
 */
export function createApiErrorResponse(
  message: string, 
  status: number = 500, 
  error: string = 'API_ERROR'
): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error,
      message 
    },
    { status }
  )
}

/**
 * API 成功回應生成器
 * 
 * @description 統一的成功回應格式
 * @param data - 回應資料
 * @param message - 成功訊息（可選）
 * @returns NextResponse 成功回應
 */
export function createApiSuccessResponse(
  data: any, 
  message?: string
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message })
  })
}

/**
 * 從請求中安全地解析查詢參數
 * 
 * @description 安全地解析 URL 查詢參數，避免直接使用 request.url
 * @param request - Next.js 請求物件
 * @returns URLSearchParams 物件
 */
export function getSearchParams(request: NextRequest): URLSearchParams {
  try {
    const { searchParams } = new URL(request.url)
    return searchParams
  } catch (error) {
    console.error('Error parsing search params:', error)
    return new URLSearchParams()
  }
}

/**
 * 分頁參數解析器
 * 
 * @description 從查詢參數中解析分頁資訊
 * @param searchParams - URLSearchParams 物件
 * @returns 分頁資訊
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * 排序參數解析器
 * 
 * @description 從查詢參數中解析排序資訊
 * @param searchParams - URLSearchParams 物件
 * @param defaultSort - 預設排序欄位
 * @param defaultOrder - 預設排序順序
 * @returns 排序資訊
 */
export function parseSortParams(
  searchParams: URLSearchParams,
  defaultSort: string = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
) {
  const sortBy = searchParams.get('sortBy') || defaultSort
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultOrder

  return { sortBy, sortOrder }
}

/**
 * API 處理器包裝器 - 統一錯誤處理
 * 
 * @description 為 API 路由提供統一的錯誤處理和日誌記錄
 * @param handler - API 處理函式
 * @param requiresAuth - 是否需要認證（預設為 true）
 * @returns 包裝後的處理函式
 */
export function withApiHandler(
  handler: (request: NextRequest, user?: User) => Promise<NextResponse>,
  requiresAuth: boolean = true
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let user: User | null = null

      if (requiresAuth) {
        const authResult = await requireApiAuth(request)
        if (!authResult.success) {
          return authResult.response!
        }
        user = authResult.user
      }

      return await handler(request, user || undefined)
    } catch (error) {
      console.error(`API Error [${request.method} ${request.nextUrl.pathname}]:`, error)
      return createApiErrorResponse(
        error instanceof Error ? error.message : '伺服器內部錯誤',
        500,
        'INTERNAL_SERVER_ERROR'
      )
    }
  }
}