/**
 * OAuth Testing Page
 * OAuth 測試頁面 - 僅在開發環境顯示
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Settings, TestTube } from 'lucide-react'

interface ConfigCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
}

export default function TestOAuthPage() {
  const [configChecks, setConfigChecks] = useState<ConfigCheck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [testResult, setTestResult] = useState<string>('')

  // 只在開發環境顯示此頁面
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      window.location.href = '/'
      return
    }

    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    setIsLoading(true)
    const checks: ConfigCheck[] = []

    // 檢查環境變數
    const requiredEnvVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXTAUTH_URL'
    ]

    // 由於在客戶端無法直接檢查環境變數，我們通過 API 檢查
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })

      if (response.ok) {
        checks.push({
          name: 'Google OAuth Configuration',
          status: 'pass',
          message: 'OAuth 配置有效，可以開始測試'
        })
      } else {
        const data = await response.json()
        checks.push({
          name: 'Google OAuth Configuration',
          status: 'fail',
          message: data.message || 'OAuth 配置無效'
        })
      }
    } catch (error) {
      checks.push({
        name: 'Google OAuth Configuration',
        status: 'fail',
        message: '無法驗證 OAuth 配置'
      })
    }

    // 檢查當前認證狀態
    try {
      const authResponse = await fetch('/api/auth/me')
      if (authResponse.ok) {
        const userData = await authResponse.json()
        checks.push({
          name: 'Current Authentication',
          status: 'pass',
          message: `已登入用戶：${userData.user?.email || 'Unknown'}`
        })
      } else {
        checks.push({
          name: 'Current Authentication',
          status: 'warn',
          message: '目前未登入，可以測試 OAuth 流程'
        })
      }
    } catch (error) {
      checks.push({
        name: 'Current Authentication',
        status: 'warn',
        message: '無法檢查認證狀態'
      })
    }

    setConfigChecks(checks)
    setIsLoading(false)
  }

  const handleOAuthTest = async () => {
    setTestResult('正在重定向到 Google OAuth...')
    
    try {
      // 重定向到 OAuth 端點
      window.location.href = '/api/auth/google?redirect=/test-oauth'
    } catch (error) {
      setTestResult(`OAuth 測試失敗: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const getStatusIcon = (status: 'pass' | 'fail' | 'warn') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warn':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: 'pass' | 'fail' | 'warn') => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      warn: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <TestTube className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">
              Google OAuth 測試頁面
            </h1>
          </div>
          <p className="text-gray-600">
            這個頁面僅在開發環境中可用，用於測試 Google OAuth 整合
          </p>
        </div>

        {/* Configuration Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              配置狀態檢查
            </CardTitle>
            <CardDescription>
              檢查 OAuth 配置是否正確設定
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">檢查配置中...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {configChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <h4 className="font-medium">{check.name}</h4>
                        <p className="text-sm text-gray-600">{check.message}</p>
                      </div>
                    </div>
                    {getStatusBadge(check.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* OAuth Testing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>OAuth 流程測試</CardTitle>
            <CardDescription>
              點擊下方按鈕測試完整的 Google OAuth 認證流程
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleOAuthTest}
                className="w-full"
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                測試 Google OAuth 登入
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '/login'}
                className="w-full"
              >
                前往登入頁面
              </Button>
            </div>

            {testResult && (
              <Alert>
                <AlertDescription>{testResult}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>設定說明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <h4>如果配置檢查失敗，請按以下步驟設定：</h4>
              <ol>
                <li>前往 <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                <li>創建或選擇專案</li>
                <li>啟用 Google+ API</li>
                <li>創建 OAuth 2.0 憑證</li>
                <li>設定重定向 URI：<code>http://localhost:3000/api/auth/callback/google</code></li>
                <li>複製 Client ID 和 Client Secret 到 <code>.env.local</code></li>
                <li>重新啟動開發伺服器</li>
              </ol>
              
              <p>詳細設定說明參考：<code>docs/google-oauth-setup.md</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}