/**
 * Unauthorized Access Page
 * 未授權存取頁面
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Home, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              存取受限
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                很抱歉，您沒有權限存取此頁面。請確認您已使用正確的帳戶登入，或聯繫系統管理員獲取相關權限。
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  重新登入
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                asChild 
                className="w-full hover:bg-gray-50"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  返回首頁
                </Link>
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                需要協助？請聯繫系統管理員
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Error Code: 403 - Forbidden
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}