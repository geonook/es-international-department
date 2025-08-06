/**
 * User Profile Page
 * 用戶個人資料頁面
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  Edit, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft,
  Shield,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  phone?: string
  roles: string[]
  avatar?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isActive: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // 編輯表單狀態
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    phone: ''
  })

  // 載入用戶資料
  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
          setEditForm({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            displayName: data.user.displayName || '',
            phone: data.user.phone || ''
          })
        } else {
          setError('載入用戶資料失敗')
        }
      } else if (response.status === 401) {
        // 未認證，跳轉到登入頁面
        router.push('/login')
        return
      } else {
        setError('載入用戶資料失敗')
      }
    } catch (error) {
      console.error('Load profile error:', error)
      setError('網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess(false)

      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setIsEditing(false)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.message || '更新失敗')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      setError('網路錯誤，請稍後再試')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
        phone: user.phone || ''
      })
    }
    setIsEditing(false)
    setError('')
  }

  // 獲取用戶姓名顯示
  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }
    return user?.email || 'Unknown User'
  }

  // 獲取用戶頭像字母
  const getAvatarLetters = () => {
    const displayName = getUserDisplayName()
    const words = displayName.split(' ')
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return displayName.slice(0, 2).toUpperCase()
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 錯誤狀態
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">載入失敗</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchUserProfile}>重新載入</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 導航 */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首頁
          </Link>
        </div>

        {/* 個人資料卡片 */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-purple-600 text-white text-lg font-semibold">
                    {getAvatarLetters()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl text-gray-900">
                    {getUserDisplayName()}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </CardDescription>
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  編輯
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 成功訊息 */}
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  個人資料更新成功！
                </AlertDescription>
              </Alert>
            )}

            {/* 錯誤訊息 */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 基本資訊 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                基本資訊
              </h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        名字
                      </label>
                      <Input
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                        placeholder="請輸入名字"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        姓氏
                      </label>
                      <Input
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                        placeholder="請輸入姓氏"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      顯示名稱
                    </label>
                    <Input
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                      placeholder="請輸入顯示名稱"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      手機號碼
                    </label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      placeholder="請輸入手機號碼"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? '儲存中...' : '儲存'}
                    </Button>
                    <Button 
                      onClick={handleCancel} 
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">名字</label>
                      <p className="text-gray-900">{user.firstName || '未設定'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">姓氏</label>
                      <p className="text-gray-900">{user.lastName || '未設定'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">顯示名稱</label>
                      <p className="text-gray-900">{user.displayName || '未設定'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">手機號碼</label>
                      <p className="text-gray-900 flex items-center gap-2">
                        {user.phone ? (
                          <>
                            <Phone className="w-4 h-4 text-gray-500" />
                            {user.phone}
                          </>
                        ) : (
                          '未設定'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 帳戶資訊 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                帳戶資訊
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">用戶角色</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">帳戶狀態</label>
                    <p className="flex items-center gap-2">
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? '啟用' : '停用'}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">註冊時間</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  {user.lastLoginAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">最後登入</label>
                      <p className="text-gray-900">
                        {formatDate(user.lastLoginAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}