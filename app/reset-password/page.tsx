/**
 * Reset Password Page  
 * 密碼重設頁面
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null)

  // 從 URL 參數獲取 email 和 token
  useEffect(() => {
    const emailParam = searchParams.get('email')
    const tokenParam = searchParams.get('token')
    
    if (emailParam) setEmail(emailParam)
    if (tokenParam) setResetToken(tokenParam)
  }, [searchParams])

  // 驗證 reset token
  useEffect(() => {
    if (email && resetToken) {
      validateToken()
    }
  }, [email, resetToken])

  const validateToken = async () => {
    setIsValidating(true)
    setError('')

    try {
      const params = new URLSearchParams()
      params.set('email', email)
      params.set('token', resetToken)

      const response = await fetch(`/api/auth/reset-password?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setIsValidToken(true)
        if (data.data?.expiresAt) {
          setTokenExpiry(new Date(data.data.expiresAt))
        }
      } else {
        setError(data.message || '重設碼無效或已過期')
        setIsValidToken(false)
      }
    } catch (error) {
      setError('驗證重設碼時發生錯誤')
      setIsValidToken(false)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // 驗證密碼
    if (newPassword !== confirmPassword) {
      setError('密碼確認不符')
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError('密碼長度至少 8 個字元')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetToken,
          newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.message || '密碼重設失敗，請重試')
      }
    } catch (error) {
      setError('網路錯誤，請檢查連線後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // 密碼強度檢查
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '' }
    
    let score = 0
    let feedback = []

    if (password.length >= 8) score += 1
    else feedback.push('至少 8 個字元')

    if (/[a-z]/.test(password)) score += 1
    else feedback.push('包含小寫字母')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('包含大寫字母')

    if (/\d/.test(password)) score += 1
    else feedback.push('包含數字')

    if (/[^a-zA-Z\d]/.test(password)) score += 1
    else feedback.push('包含特殊字元')

    const strength = ['很弱', '弱', '一般', '強', '很強'][Math.min(score, 4)]
    const color = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'][Math.min(score, 4)]

    return { score, text: strength, color, feedback }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  // 成功頁面
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              密碼重設成功
            </CardTitle>
            <CardDescription>
              您的密碼已成功更新
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                密碼已成功重設。請使用新密碼登入系統。
                為了安全起見，所有現有的登入會話已被清除。
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              前往登入頁面
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 驗證中
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">正在驗證重設碼...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Token 無效
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              重設碼無效
            </CardTitle>
            <CardDescription>
              重設碼可能已過期或無效
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => router.push('/forgot-password')}
                className="w-full"
              >
                重新申請密碼重設
              </Button>
              
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

  // 重設密碼表單
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            重設密碼
          </CardTitle>
          <CardDescription>
            為 {email} 設定新密碼
            {tokenExpiry && (
              <div className="text-sm text-gray-500 mt-1">
                重設碼將於 {tokenExpiry.toLocaleString()} 過期
              </div>
            )}
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
              <label htmlFor="resetToken" className="text-sm font-medium text-gray-700">
                重設碼
              </label>
              <Input
                id="resetToken"
                type="text"
                placeholder="請輸入 6 位數重設碼"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
                disabled={isLoading}
                maxLength={6}
                className="font-mono text-center text-lg"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                新密碼
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="請輸入新密碼"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {newPassword && (
                <div className="text-xs">
                  <div className={`font-medium ${passwordStrength.color}`}>
                    密碼強度: {passwordStrength.text}
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-gray-500 mt-1">
                      建議: {passwordStrength.feedback.join('、')}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                確認新密碼
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="請再次輸入新密碼"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <div className="text-xs text-red-500">
                  密碼確認不符
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !resetToken || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              {isLoading ? '重設中...' : '重設密碼'}
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