'use client'

/**
 * AnnouncementForm Component
 * 新增/編輯公告的表單組件
 */

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import {
  Save,
  Send,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Users,
  GraduationCap,
  Globe,
  Loader2,
  X,
  Image
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
// import { sanitizeHtml, extractTextFromHtml, validateHtmlContent } from '@/lib/html-sanitizer'
import {
  AnnouncementFormProps,
  AnnouncementFormData,
  TARGET_AUDIENCE_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS
} from '@/lib/types'

// 簡化的 HTML 清理函數
const sanitizeHtml = (html: string) => {
  // 基本的 HTML 清理，移除危險標籤
  return html.replace(/<script[^>]*>.*?<\/script>/gi, '')
             .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
             .replace(/javascript:/gi, '')
             .replace(/on\w+=/gi, '')
}

const extractTextFromHtml = (html: string) => {
  // 提取 HTML 中的純文字
  return html.replace(/<[^>]*>/g, '').trim()
}

// 表單驗證 Schema
const announcementSchema = z.object({
  title: z
    .string()
    .min(1, '標題為必填項目')
    .max(200, '標題不能超過 200 個字元'),
  content: z
    .string()
    .min(1, '內容為必填項目')
    .max(50000, '內容不能超過 50000 個字元'),
  summary: z
    .string()
    .max(500, '摘要不能超過 500 個字元')
    .optional(),
  targetAudience: z.enum(['teachers', 'parents', 'all'], {
    required_error: '請選擇目標對象'
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: '請選擇優先級'
  }),
  status: z.enum(['draft', 'published', 'archived'], {
    required_error: '請選擇狀態'
  }),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional()
}).refine((data) => {
  // 如果設定了發布時間和到期時間，確保到期時間晚於發布時間
  if (data.publishedAt && data.expiresAt) {
    return new Date(data.expiresAt) > new Date(data.publishedAt)
  }
  return true
}, {
  message: '到期時間必須晚於發布時間',
  path: ['expiresAt']
}).refine((data) => {
  // 如果狀態為已發布，確保有發布時間
  if (data.status === 'published' && !data.publishedAt) {
    return false
  }
  return true
}, {
  message: '發布公告時必須設定發布時間',
  path: ['publishedAt']
})

type FormData = z.infer<typeof announcementSchema>

// 圖片上傳類型定義
interface UploadedImage {
  fileId: string
  originalName: string
  publicUrl: string
  thumbnailUrl?: string
  fileSize: number
}

export default function AnnouncementForm({
  announcement,
  onSubmit,
  onCancel,
  loading = false,
  error,
  mode = 'create',
  className
}: AnnouncementFormProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null)
  
  const isEditMode = mode === 'edit' && announcement

  // 初始化表單
  const form = useForm<FormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement?.title || '',
      content: announcement?.content || '',
      summary: announcement?.summary || '',
      targetAudience: announcement?.targetAudience || 'all',
      priority: announcement?.priority || 'medium',
      status: announcement?.status || 'draft',
      publishedAt: announcement?.publishedAt ? 
        format(new Date(announcement.publishedAt), "yyyy-MM-dd'T'HH:mm") : '',
      expiresAt: announcement?.expiresAt ? 
        format(new Date(announcement.expiresAt), "yyyy-MM-dd'T'HH:mm") : ''
    }
  })

  const { handleSubmit, watch, formState: { isSubmitting, errors } } = form
  const watchedValues = watch()

  // 監聽表單變化
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name) {
        setIsDirty(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // 處理表單提交
  const onSubmitHandler = async (data: FormData) => {
    try {
      // 清理 HTML 內容
      const sanitizedData = {
        ...data,
        content: sanitizeHtml(data.content),
        summary: data.summary ? extractTextFromHtml(data.summary) : data.summary
      }
      
      await onSubmit(sanitizedData)
      setIsDirty(false)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // 處理草稿儲存
  const handleSaveDraft = async () => {
    const data = form.getValues()
    data.status = 'draft'
    // 生成摘要（如果沒有手動輸入）
    if (!data.summary && data.content) {
      const textContent = extractTextFromHtml(data.content)
      data.summary = textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent
    }
    await onSubmitHandler(data)
  }

  // 處理發布
  const handlePublish = async () => {
    const data = form.getValues()
    data.status = 'published'
    if (!data.publishedAt) {
      data.publishedAt = format(new Date(), "yyyy-MM-dd'T'HH:mm")
    }
    // 生成摘要（如果沒有手動輸入）
    if (!data.summary && data.content) {
      const textContent = extractTextFromHtml(data.content)
      data.summary = textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent
    }
    await onSubmitHandler(data)
  }

  // 處理取消
  const handleCancel = () => {
    if (isDirty && !confirm('有未儲存的變更，確定要離開嗎？')) {
      return
    }
    onCancel?.()
  }

  // 自動儲存處理
  const handleAutoSave = useCallback(async (content: string) => {
    if (!autoSaveEnabled || !isDirty) return
    
    try {
      // 只在編輯模式下自動儲存草稿
      if (isEditMode) {
        const data = form.getValues()
        data.content = content
        data.status = 'draft'
        
        await onSubmit({ ...data, content: sanitizeHtml(content) })
        setLastAutoSave(new Date())
        setIsDirty(false)
      }
    } catch (error) {
      console.error('Auto save error:', error)
    }
  }, [autoSaveEnabled, isDirty, isEditMode, form, onSubmit])


  // 取得目標對象圖示
  const getTargetAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'teachers':
        return <GraduationCap className="w-4 h-4" />
      case 'parents':
        return <Users className="w-4 h-4" />
      case 'all':
        return <Globe className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("max-w-4xl mx-auto", className)}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {isEditMode ? '編輯公告' : '新增公告'}
              </CardTitle>
              {isEditMode && (
                <p className="text-sm text-gray-600 mt-1">
                  公告 ID: {announcement.id}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* 自動儲存開關 */}
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    autoSaveEnabled ? "text-green-600 border-green-300" : "text-gray-500"
                  )}
                  title={autoSaveEnabled ? '關閉自動儲存' : '開啟自動儲存'}
                >
                  {autoSaveEnabled ? '自動儲存' : '手動儲存'}
                </Button>
              )}
              
              {/* 預覽模式切換 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2"
              >
                {previewMode ? (
                  <>
                    <Eye className="w-4 h-4" />
                    編輯模式
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    預覽模式
                  </>
                )}
              </Button>

              {/* 關閉按鈕 */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 狀態指示 */}
          {isDirty && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                表單有未儲存的變更
              </AlertDescription>
            </Alert>
          )}

          {/* 錯誤訊息 */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        </CardHeader>

        <CardContent>
          {previewMode ? (
            // 預覽模式
            <div className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h1 className="text-2xl font-bold mb-4">{watchedValues.title}</h1>
                
                {watchedValues.summary && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-blue-800 mb-2">摘要</h3>
                    <p className="text-blue-700">{watchedValues.summary}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTargetAudienceIcon(watchedValues.targetAudience)}
                    {TARGET_AUDIENCE_LABELS[watchedValues.targetAudience]}
                  </Badge>
                  <Badge variant="secondary">
                    {PRIORITY_LABELS[watchedValues.priority]}
                  </Badge>
                  <Badge variant="default">
                    {STATUS_LABELS[watchedValues.status]}
                  </Badge>
                </div>

                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: watchedValues.content || '<p>暫無內容</p>'
                  }}
                />

                {(watchedValues.publishedAt || watchedValues.expiresAt) && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      {watchedValues.publishedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>發布時間: {format(new Date(watchedValues.publishedAt), 'yyyy/MM/dd HH:mm', { locale: zhTW })}</span>
                        </div>
                      )}
                      {watchedValues.expiresAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>到期時間: {format(new Date(watchedValues.expiresAt), 'yyyy/MM/dd HH:mm', { locale: zhTW })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // 編輯模式
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
                {/* 基本資訊 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {/* 標題 */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>標題 *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="請輸入公告標題"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 摘要 */}
                    <FormField
                      control={form.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>摘要</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="請輸入公告摘要（選填）"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            簡短描述公告內容，將顯示在公告列表中
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 內容 */}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>內容 *</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="請輸入公告詳細內容..."
                              minHeight={300}
                              maxHeight={600}
                              maxLength={50000}
                              autoSave={autoSaveEnabled && isEditMode}
                              autoSaveInterval={30000} // 30秒自動儲存
                              onAutoSave={handleAutoSave}
                              enableImageUpload={true}
                              relatedType="announcement"
                              relatedId={announcement?.id}
                              error={errors.content?.message}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription className="flex items-center justify-between">
                            <span>支援富文本格式、圖片上傳，字數限制：50000 字元</span>
                            {lastAutoSave && isEditMode && (
                              <span className="text-xs text-green-600">
                                最後自動儲存: {format(lastAutoSave, 'HH:mm:ss', { locale: zhTW })}
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 設定面板 */}
                  <div className="space-y-4">
                    {/* 目標對象 */}
                    <FormField
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>目標對象 *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇目標對象" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  所有人
                                </div>
                              </SelectItem>
                              <SelectItem value="teachers">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4" />
                                  教師
                                </div>
                              </SelectItem>
                              <SelectItem value="parents">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  家長
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 優先級 */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>優先級 *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇優先級" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="high">高優先級</SelectItem>
                              <SelectItem value="medium">一般</SelectItem>
                              <SelectItem value="low">低優先級</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 狀態 */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>狀態 *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇狀態" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">草稿</SelectItem>
                              <SelectItem value="published">已發布</SelectItem>
                              <SelectItem value="archived">已封存</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 發布時間 */}
                    <FormField
                      control={form.control}
                      name="publishedAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>發布時間</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            留空則使用當前時間
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 到期時間 */}
                    <FormField
                      control={form.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>到期時間</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            留空則永不過期
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 表單按鈕 */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading || isSubmitting}
                  >
                    取消
                  </Button>

                  <div className="flex items-center gap-2">
                    {/* 儲存草稿 */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={loading || isSubmitting}
                      className="flex items-center gap-2"
                    >
                      {loading && watchedValues.status === 'draft' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      儲存草稿
                    </Button>

                    {/* 發布/更新 */}
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={loading || isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2"
                    >
                      {loading && watchedValues.status === 'published' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isEditMode ? '更新公告' : '發布公告'}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}