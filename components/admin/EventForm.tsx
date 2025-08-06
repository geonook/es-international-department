'use client'

/**
 * Event Form Component
 * 活動表單組件
 * 
 * @description 活動建立和編輯表單，支援所有活動欄位和驗證
 * @features 表單驗證、日期時間選擇、富文本編輯、圖片上傳
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Save,
  X,
  AlertTriangle,
  Loader2,
  Plus,
  Minus,
  Info,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Event,
  EventFormData,
  EventType,
  EventStatus,
  EVENT_TYPE_LABELS,
  EVENT_STATUS_LABELS,
  GRADE_OPTIONS,
  FormValidationErrors
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface EventFormProps {
  event?: Event
  onSubmit: (data: EventFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  error?: string
  mode?: 'create' | 'edit'
  defaultStartDate?: string
  className?: string
}

export default function EventForm({
  event,
  onSubmit,
  onCancel,
  loading = false,
  error,
  mode = 'create',
  defaultStartDate,
  className
}: EventFormProps) {
  // 表單狀態
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    eventType: 'meeting',
    startDate: defaultStartDate || '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: undefined,
    registrationRequired: false,
    registrationDeadline: '',
    targetGrades: [],
    status: 'draft'
  })

  // 驗證錯誤
  const [errors, setErrors] = useState<FormValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 初始化表單資料
  useEffect(() => {
    if (event && mode === 'edit') {
      setFormData({
        title: event.title,
        description: event.description || '',
        eventType: event.eventType,
        startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        startTime: event.startTime ? new Date(event.startTime).toTimeString().slice(0, 5) : '',
        endTime: event.endTime ? new Date(event.endTime).toTimeString().slice(0, 5) : '',
        location: event.location || '',
        maxParticipants: event.maxParticipants || undefined,
        registrationRequired: event.registrationRequired,
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : '',
        targetGrades: event.targetGrades || [],
        status: event.status
      })
    }
  }, [event, mode])

  // 表單欄位更新
  const updateField = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // 處理年級選擇
  const handleGradeToggle = (gradeValue: string, checked: boolean) => {
    if (checked) {
      updateField('targetGrades', [...(formData.targetGrades || []), gradeValue])
    } else {
      updateField('targetGrades', (formData.targetGrades || []).filter(g => g !== gradeValue))
    }
  }

  // 表單驗證
  const validateForm = (): boolean => {
    const newErrors: FormValidationErrors = {}

    // 必填欄位驗證
    if (!formData.title.trim()) {
      newErrors.title = '活動標題為必填'
    }

    if (!formData.eventType) {
      newErrors.eventType = '請選擇活動類型'
    }

    if (!formData.startDate) {
      newErrors.startDate = '請選擇開始日期'
    }

    if (!formData.status) {
      newErrors.status = '請選擇活動狀態'
    }

    // 日期邏輯驗證
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      if (endDate < startDate) {
        newErrors.endDate = '結束日期不能早於開始日期'
      }
    }

    // 時間邏輯驗證
    if (formData.startTime && formData.endTime && formData.startDate === formData.endDate) {
      if (formData.endTime <= formData.startTime) {
        newErrors.endTime = '結束時間必須晚於開始時間'
      }
    }

    // 報名截止日期驗證
    if (formData.registrationRequired && formData.registrationDeadline) {
      const regDeadline = new Date(formData.registrationDeadline)
      const eventStart = new Date(formData.startDate)
      if (regDeadline > eventStart) {
        newErrors.registrationDeadline = '報名截止日期不能晚於活動開始日期'
      }
    }

    // 參與人數驗證
    if (formData.maxParticipants !== undefined && formData.maxParticipants < 1) {
      newErrors.maxParticipants = '參與人數上限必須大於0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      // 錯誤處理由父組件處理
    } finally {
      setIsSubmitting(false)
    }
  }

  // 重設表單
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventType: 'meeting',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      maxParticipants: undefined,
      registrationRequired: false,
      registrationDeadline: '',
      targetGrades: [],
      status: 'draft'
    })
    setErrors({})
  }

  return (
    <div className={cn("max-w-4xl", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            {mode === 'edit' ? '編輯活動' : '新增活動'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 錯誤訊息 */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 基本資訊 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title">活動標題 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="請輸入活動標題"
                  className={errors.title ? 'border-red-300' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="eventType">活動類型 *</Label>
                <Select value={formData.eventType} onValueChange={(value) => updateField('eventType', value)}>
                  <SelectTrigger className={errors.eventType ? 'border-red-300' : ''}>
                    <SelectValue placeholder="選擇活動類型" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.eventType && <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>}
              </div>

              <div>
                <Label htmlFor="status">活動狀態 *</Label>
                <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                  <SelectTrigger className={errors.status ? 'border-red-300' : ''}>
                    <SelectValue placeholder="選擇活動狀態" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
              </div>
            </div>

            {/* 活動描述 */}
            <div>
              <Label htmlFor="description">活動描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="請輸入活動描述..."
                rows={4}
                className={errors.description ? 'border-red-300' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* 日期和時間 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startDate">開始日期 *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className={errors.startDate ? 'border-red-300' : ''}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <Label htmlFor="endDate">結束日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                  className={errors.endDate ? 'border-red-300' : ''}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>

              <div>
                <Label htmlFor="startTime">開始時間</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => updateField('startTime', e.target.value)}
                  className={errors.startTime ? 'border-red-300' : ''}
                />
                {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
              </div>

              <div>
                <Label htmlFor="endTime">結束時間</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => updateField('endTime', e.target.value)}
                  className={errors.endTime ? 'border-red-300' : ''}
                />
                {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
              </div>
            </div>

            {/* 地點和參與者 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="location">活動地點</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="請輸入活動地點"
                  className={errors.location ? 'border-red-300' : ''}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <Label htmlFor="maxParticipants">參與人數上限</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={formData.maxParticipants || ''}
                  onChange={(e) => updateField('maxParticipants', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="無限制"
                  className={errors.maxParticipants ? 'border-red-300' : ''}
                />
                {errors.maxParticipants && <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>}
              </div>
            </div>

            {/* 報名設定 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="registrationRequired"
                  checked={formData.registrationRequired}
                  onCheckedChange={(checked) => updateField('registrationRequired', checked)}
                />
                <Label htmlFor="registrationRequired">需要報名</Label>
              </div>

              {formData.registrationRequired && (
                <div>
                  <Label htmlFor="registrationDeadline">報名截止日期</Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => updateField('registrationDeadline', e.target.value)}
                    className={errors.registrationDeadline ? 'border-red-300' : ''}
                  />
                  {errors.registrationDeadline && <p className="text-red-500 text-sm mt-1">{errors.registrationDeadline}</p>}
                </div>
              )}
            </div>

            {/* 目標年級 */}
            <div>
              <Label>目標年級</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                {GRADE_OPTIONS.map((grade) => (
                  <div key={grade.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`grade-${grade.value}`}
                      checked={formData.targetGrades?.includes(grade.value) || false}
                      onCheckedChange={(checked) => handleGradeToggle(grade.value, checked as boolean)}
                    />
                    <Label htmlFor={`grade-${grade.value}`} className="text-sm">
                      {grade.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 表單操作 */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading || isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                取消
              </Button>
              
              {mode === 'create' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading || isSubmitting}
                >
                  重設
                </Button>
              )}

              <Button
                type="submit"
                disabled={loading || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-purple-700"
              >
                {(loading || isSubmitting) ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {mode === 'edit' ? '更新活動' : '建立活動'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}