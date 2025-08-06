'use client'

/**
 * Notification Settings Component
 * 通知設定組件
 * 
 * @description 用戶通知偏好設定界面，允許用戶自定義通知方式和類別
 * @features 通知方式選擇、分類設定、免打擾模式、即時預覽
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Mail, 
  Monitor, 
  Smartphone, 
  Clock, 
  Save, 
  RotateCcw,
  Volume2,
  VolumeX,
  Settings,
  Check,
  AlertTriangle,
  Calendar,
  Users,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// 通知偏好設定接口
interface NotificationPreferences {
  email: boolean
  system: boolean
  browser: boolean
  doNotDisturb: {
    enabled: boolean
    startTime: string
    endTime: string
  }
  categories: {
    [key: string]: {
      enabled: boolean
      email: boolean
      system: boolean
    }
  }
}

// 通知類別配置
const NOTIFICATION_CATEGORIES = [
  {
    id: 'system',
    name: '系統通知',
    description: '系統更新、維護通知等',
    icon: Monitor,
    color: 'text-blue-600 bg-blue-50'
  },
  {
    id: 'announcement',
    name: '公告通知',
    description: '學校公告、重要消息',
    icon: Bell,
    color: 'text-green-600 bg-green-50'
  },
  {
    id: 'event',
    name: '活動通知',
    description: '學校活動、會議通知',
    icon: Calendar,
    color: 'text-purple-600 bg-purple-50'
  },
  {
    id: 'registration',
    name: '報名通知',
    description: '活動報名、狀態更新',
    icon: Users,
    color: 'text-orange-600 bg-orange-50'
  },
  {
    id: 'resource',
    name: '資源更新',
    description: '教學資源、檔案更新',
    icon: FileText,
    color: 'text-teal-600 bg-teal-50'
  },
  {
    id: 'newsletter',
    name: '電子報',
    description: '學校電子報、期刊',
    icon: Mail,
    color: 'text-indigo-600 bg-indigo-50'
  },
  {
    id: 'maintenance',
    name: '維護通知',
    description: '系統維護、停機通知',
    icon: Settings,
    color: 'text-red-600 bg-red-50'
  },
  {
    id: 'reminder',
    name: '提醒通知',
    description: '活動提醒、截止日期',
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-50'
  }
]

interface NotificationSettingsProps {
  className?: string
  onPreferencesChange?: (preferences: NotificationPreferences) => void
}

export default function NotificationSettings({
  className,
  onPreferencesChange
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    system: true,
    browser: true,
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    },
    categories: NOTIFICATION_CATEGORIES.reduce((acc, category) => {
      acc[category.id] = {
        enabled: true,
        email: true,
        system: true
      }
      return acc
    }, {} as any)
  })

  const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences>(preferences)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // 載入用戶偏好設定
  useEffect(() => {
    loadPreferences()
  }, [])

  // 檢測設定變更
  useEffect(() => {
    const changed = JSON.stringify(preferences) !== JSON.stringify(originalPreferences)
    setHasChanges(changed)
  }, [preferences, originalPreferences])

  const loadPreferences = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.preferences) {
          setPreferences(data.preferences)
          setOriginalPreferences(data.preferences)
        }
      } else {
        setError('載入設定失敗')
      }
    } catch (error) {
      console.error('Load preferences error:', error)
      setError('網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const savePreferences = async () => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess(false)

      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(preferences)
      })

      const data = await response.json()

      if (data.success) {
        setOriginalPreferences(preferences)
        setSuccess(true)
        onPreferencesChange?.(preferences)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.message || '儲存失敗')
      }
    } catch (error) {
      console.error('Save preferences error:', error)
      setError('網路錯誤，請稍後再試')
    } finally {
      setIsSaving(false)
    }
  }

  const resetPreferences = () => {
    setPreferences(originalPreferences)
  }

  const updateGlobalSetting = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateCategorySetting = (categoryId: string, setting: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryId]: {
          ...prev.categories[categoryId],
          [setting]: value
        }
      }
    }))
  }

  const updateDoNotDisturb = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      doNotDisturb: {
        ...prev.doNotDisturb,
        [field]: value
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">載入設定中...</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 成功訊息 */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>通知設定已成功儲存</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 全域通知設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            全域通知設定
          </CardTitle>
          <p className="text-sm text-gray-600">選擇您希望接收通知的方式</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 通知方式選擇 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <Label className="font-medium">電子郵件</Label>
                  <p className="text-xs text-gray-500">發送到您的信箱</p>
                </div>
              </div>
              <Switch
                checked={preferences.email}
                onCheckedChange={(value) => updateGlobalSetting('email', value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-green-600" />
                <div>
                  <Label className="font-medium">系統通知</Label>
                  <p className="text-xs text-gray-500">在平台內顯示</p>
                </div>
              </div>
              <Switch
                checked={preferences.system}
                onCheckedChange={(value) => updateGlobalSetting('system', value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <div>
                  <Label className="font-medium">瀏覽器推播</Label>
                  <p className="text-xs text-gray-500">即時推播通知</p>
                </div>
              </div>
              <Switch
                checked={preferences.browser}
                onCheckedChange={(value) => updateGlobalSetting('browser', value)}
              />
            </div>
          </div>

          <Separator />

          {/* 免打擾模式 */}
          <div>
            <Label className="text-base font-medium flex items-center gap-2">
              <VolumeX className="w-4 h-4" />
              免打擾模式
            </Label>
            <p className="text-sm text-gray-600 mb-4">在指定時間內暫停非緊急通知</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={preferences.doNotDisturb.enabled}
                  onCheckedChange={(value) => updateDoNotDisturb('enabled', value)}
                />
                <Label>啟用免打擾模式</Label>
              </div>

              {preferences.doNotDisturb.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-4 ml-8"
                >
                  <div>
                    <Label className="text-sm">開始時間</Label>
                    <Select 
                      value={preferences.doNotDisturb.startTime} 
                      onValueChange={(value) => updateDoNotDisturb('startTime', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0')
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-gray-500">至</span>
                  <div>
                    <Label className="text-sm">結束時間</Label>
                    <Select 
                      value={preferences.doNotDisturb.endTime} 
                      onValueChange={(value) => updateDoNotDisturb('endTime', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0')
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分類通知設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            分類通知設定
          </CardTitle>
          <p className="text-sm text-gray-600">為不同類型的通知設定接收偏好</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {NOTIFICATION_CATEGORIES.map((category) => {
              const CategoryIcon = category.icon
              const categoryPrefs = preferences.categories[category.id]
              
              return (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", category.color)}>
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <Label className="font-medium">{category.name}</Label>
                        <p className="text-xs text-gray-500">{category.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={categoryPrefs?.enabled ?? true}
                      onCheckedChange={(value) => updateCategorySetting(category.id, 'enabled', value)}
                    />
                  </div>

                  {/* 細項設定 */}
                  {categoryPrefs?.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-2 gap-4 ml-12"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">電子郵件</Label>
                        <Switch
                          checked={categoryPrefs.email ?? true}
                          onCheckedChange={(value) => updateCategorySetting(category.id, 'email', value)}
                          disabled={!preferences.email}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">系統通知</Label>
                        <Switch
                          checked={categoryPrefs.system ?? true}
                          onCheckedChange={(value) => updateCategorySetting(category.id, 'system', value)}
                          disabled={!preferences.system}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 操作按鈕 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">
              未儲存的變更
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={resetPreferences}
            disabled={!hasChanges || isSaving}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
          
          <Button
            onClick={savePreferences}
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? '儲存中...' : '儲存設定'}
          </Button>
        </div>
      </div>
    </div>
  )
}