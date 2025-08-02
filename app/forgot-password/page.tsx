/**
 * Forgot Password Page
 * 忘記密碼申請頁面
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resetToken, setResetToken] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // 開發環境中顯示 reset token
        if (data.data?.development && data.data?.resetToken) {
          setResetToken(data.data.resetToken)
        }
      } else {
        setError(data.message || '申請失敗，請稍後再試')
      }
    } catch (error) {
      setError('網路錯誤，請檢查連線後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = () => {
    // 跳轉到重設密碼頁面
    const params = new URLSearchParams()
    params.set('email', email)
    if (resetToken) {
      params.set('token', resetToken)
    }
    router.push(`/reset-password?${params.toString()}`)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              申請成功
            </CardTitle>
            <CardDescription>
              密碼重設申請已處理
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                如果該 Email 存在於系統中，重設指示已發送至您的信箱。
                請檢查您的郵件並按照指示重設密碼。
              </AlertDescription>
            </Alert>

            {/* 開發環境顯示 reset token */}
            {resetToken && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">開發模式 - 重設碼:</div>
                  <div className="font-mono text-lg bg-gray-100 p-2 rounded">
                    {resetToken}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    此重設碼將在 15 分鐘後過期
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-2">
              {resetToken && (
                <Button 
                  onClick={handleResetPassword}
                  className="w-full"
                >
                  直接重設密碼
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                返回登入頁面
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            忘記密碼
          </CardTitle>
          <CardDescription>
            輸入您的 Email 地址，我們將發送重設密碼的指示給您
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email 地址
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email}
            >
              {isLoading ? '處理中...' : '發送重設指示'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回登入頁面
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}