/**
 * Next.js Middleware - Lightweight Route Protection
 * KCISLK ESID Info Hub 輕量級路由保護中介軟體
 * 
 * Note: This middleware is disabled for Zeabur deployment compatibility
 * Authentication is handled at the component/API level instead
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * 中介軟體設定 - 目前停用以避免 Edge Runtime 相容性問題
 * 認證邏輯已移至元件和 API 層面處理
 */
export const config = {
  matcher: [
    // Temporarily disabled for deployment compatibility
    // '/((?!api/auth|api/health|_next/static|_next/image|favicon.ico).*)',
  ],
}

/**
 * 簡化的中介軟體 - 僅處理基本路由
 * 完整認證邏輯在各 API route 中實現
 */
export default function middleware(request: NextRequest) {
  // Skip all processing for deployment compatibility
  // Authentication is handled in individual API routes and pages
  return NextResponse.next()
}