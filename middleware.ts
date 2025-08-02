/**
 * Next.js Middleware - Global Authentication Protection
 * ES International Department 全域認證保護中介軟體
 */

import { NextRequest } from 'next/server'
import { authMiddleware } from '@/lib/middleware'

/**
 * 中介軟體設定
 * 定義需要保護的路徑模式
 */
export const config = {
  matcher: [
    /*
     * 需要認證保護的路徑:
     * - /admin 所有管理頁面
     * - /teachers 教師專用頁面
     * - /api/admin 管理 API
     * - /api/teachers 教師 API
     * - /api/announcements/create, update, delete
     * - /api/users 使用者管理 API
     * 
     * 排除的路徑:
     * - /api/auth/* 認證相關 API
     * - /_next/* Next.js 內部資源
     * - /static/* 靜態檔案
     */
    '/((?!api/auth|api/health|_next/static|_next/image|favicon.ico).*)',
  ],
}

/**
 * 中介軟體主函式
 * 將所有請求導向認證中介軟體進行處理
 */
export default function middleware(request: NextRequest) {
  return authMiddleware(request)
}