'use client'

/**
 * Unified Communication Form Component
 * 統一通訊表單組件 - Consolidates AnnouncementForm and MessageBoardForm functionality
 * 
 * Features:
 * - Unified form for all communication types (announcement, message, reminder, newsletter)
 * - Rich text editor with image upload
 * - Preview mode
 * - Auto-save functionality
 * - Professional educational design
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
  MessageSquare,
  Bell,
  Mail
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
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { colors, spacing } from '@/lib/design-system'

// Types from the unified Communication model
export type CommunicationType = 'announcement' | 'message' | 'reminder' | 'newsletter'
export type SourceGroup = 'Vickie' | 'Matthew' | 'Academic Team' | 'Admin Office' | 'IT Support'
export type TargetAudience = 'teachers' | 'parents' | 'all'
export type BoardType = 'teachers' | 'parents' | 'general'
export type PriorityLevel = 'low' | 'medium' | 'high'
export type StatusValue = 'draft' | 'published' | 'archived' | 'closed'

export interface Communication {
  id?: number
  title: string
  content: string
  summary?: string
  type: CommunicationType
  sourceGroup?: SourceGroup
  targetAudience: TargetAudience
  boardType: BoardType
  priority: PriorityLevel
  status: StatusValue
  isImportant: boolean
  isPinned: boolean
  isFeatured: boolean
  publishedAt?: string
  expiresAt?: string
  viewCount?: number
  replyCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface CommunicationFormProps {
  communication?: Communication
  onSubmit: (data: Communication) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  error?: string
  mode?: 'create' | 'edit'
  defaultType?: CommunicationType
  className?: string
}

// Labels for select options
const TYPE_LABELS: Record<CommunicationType, string> = {
  announcement: 'Announcement',
  message: 'Message',
  reminder: 'Reminder',
  newsletter: 'Newsletter'
}

const SOURCE_GROUP_LABELS: Record<SourceGroup, string> = {
  'Vickie': 'Vickie',
  'Matthew': 'Matthew',
  'Academic Team': 'Academic Team',
  'Admin Office': 'Admin Office',
  'IT Support': 'IT Support'
}

const TARGET_AUDIENCE_LABELS: Record<TargetAudience, string> = {
  teachers: 'Teachers',
  parents: 'Parents',
  all: 'Everyone'
}

const BOARD_TYPE_LABELS: Record<BoardType, string> = {
  teachers: 'Teachers Board',
  parents: 'Parents Board',
  general: 'General Board'
}

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority'
}

const STATUS_LABELS: Record<StatusValue, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
  closed: 'Closed'
}

// Form validation schema
const communicationSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content cannot exceed 50000 characters'),
  summary: z
    .string()
    .max(500, 'Summary cannot exceed 500 characters')
    .optional(),
  type: z.enum(['announcement', 'message', 'reminder', 'newsletter'], {
    required_error: 'Please select communication type'
  }),
  sourceGroup: z.enum(['Vickie', 'Matthew', 'Academic Team', 'Admin Office', 'IT Support']).optional(),
  targetAudience: z.enum(['teachers', 'parents', 'all'], {
    required_error: 'Please select target audience'
  }),
  boardType: z.enum(['teachers', 'parents', 'general'], {
    required_error: 'Please select board type'
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select priority level'
  }),
  status: z.enum(['draft', 'published', 'archived', 'closed'], {
    required_error: 'Please select status'
  }),
  isImportant: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional()
}).refine((data) => {
  if (data.publishedAt && data.expiresAt) {
    return new Date(data.expiresAt) > new Date(data.publishedAt)
  }
  return true
}, {
  message: 'Expiry time must be later than publish time',
  path: ['expiresAt']
}).refine((data) => {
  if (data.status === 'published' && !data.publishedAt) {
    return false
  }
  return true
}, {
  message: 'Publish time must be set when publishing communication',
  path: ['publishedAt']
})

type FormData = z.infer<typeof communicationSchema>

// Utility functions
const sanitizeHtml = (html: string) => {
  return html.replace(/<script[^>]*>.*?<\/script>/gi, '')
             .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
             .replace(/javascript:/gi, '')
             .replace(/on\w+=/gi, '')
}

const extractTextFromHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '').trim()
}

export default function CommunicationForm({
  communication,
  onSubmit,
  onCancel,
  loading = false,
  error,
  mode = 'create',
  defaultType = 'message',
  className
}: CommunicationFormProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null)
  
  const isEditMode = mode === 'edit' && communication

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      title: communication?.title || '',
      content: communication?.content || '',
      summary: communication?.summary || '',
      type: communication?.type || defaultType,
      sourceGroup: communication?.sourceGroup,
      targetAudience: communication?.targetAudience || 'all',
      boardType: communication?.boardType || 'general',
      priority: communication?.priority || 'medium',
      status: communication?.status || 'draft',
      isImportant: communication?.isImportant || false,
      isPinned: communication?.isPinned || false,
      isFeatured: communication?.isFeatured || false,
      publishedAt: communication?.publishedAt ? 
        format(new Date(communication.publishedAt), "yyyy-MM-dd'T'HH:mm") : '',
      expiresAt: communication?.expiresAt ? 
        format(new Date(communication.expiresAt), "yyyy-MM-dd'T'HH:mm") : ''
    }
  })

  const { handleSubmit, watch, formState: { isSubmitting, errors } } = form
  const watchedValues = watch()

  // Monitor form changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name) {
        setIsDirty(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Handle form submission
  const onSubmitHandler = async (data: FormData) => {
    try {
      const sanitizedData = {
        ...data,
        content: sanitizeHtml(data.content),
        summary: data.summary ? extractTextFromHtml(data.summary) : data.summary
      } as Communication
      
      await onSubmit(sanitizedData)
      setIsDirty(false)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // Handle draft saving
  const handleSaveDraft = async () => {
    const data = form.getValues()
    data.status = 'draft'
    if (!data.summary && data.content) {
      const textContent = extractTextFromHtml(data.content)
      data.summary = textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent
    }
    await onSubmitHandler(data)
  }

  // Handle publishing
  const handlePublish = async () => {
    const data = form.getValues()
    data.status = 'published'
    if (!data.publishedAt) {
      data.publishedAt = format(new Date(), "yyyy-MM-dd'T'HH:mm")
    }
    if (!data.summary && data.content) {
      const textContent = extractTextFromHtml(data.content)
      data.summary = textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent
    }
    await onSubmitHandler(data)
  }

  // Handle cancel
  const handleCancel = () => {
    if (isDirty && !confirm('There are unsaved changes. Are you sure you want to leave?')) {
      return
    }
    onCancel?.()
  }

  // Auto-save handling
  const handleAutoSave = useCallback(async (content: string) => {
    if (!autoSaveEnabled || !isDirty || !isEditMode) return
    
    try {
      const data = form.getValues()
      data.content = content
      data.status = 'draft'
      
      await onSubmit({ ...data, content: sanitizeHtml(content) } as Communication)
      setLastAutoSave(new Date())
      setIsDirty(false)
    } catch (error) {
      console.error('Auto save error:', error)
    }
  }, [autoSaveEnabled, isDirty, isEditMode, form, onSubmit])

  // Get type icon
  const getTypeIcon = (type: CommunicationType) => {
    switch (type) {
      case 'announcement': return <FileText className="w-4 h-4" />
      case 'message': return <MessageSquare className="w-4 h-4" />
      case 'reminder': return <Bell className="w-4 h-4" />
      case 'newsletter': return <Mail className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  // Get target audience icon
  const getTargetAudienceIcon = (audience: TargetAudience) => {
    switch (audience) {
      case 'teachers': return <GraduationCap className="w-4 h-4" />
      case 'parents': return <Users className="w-4 h-4" />
      case 'all': return <Globe className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
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
      className={cn("max-w-5xl mx-auto", className)}
    >
      <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                {getTypeIcon(watchedValues.type || defaultType)}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {isEditMode ? 'Edit Communication' : 'Create Communication'}
                </span>
              </CardTitle>
              {isEditMode && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Badge variant="secondary">{TYPE_LABELS[watchedValues.type || 'message']}</Badge>
                  ID: {communication?.id}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Auto-save toggle */}
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className={cn(
                    "flex items-center gap-2 text-xs transition-all duration-200",
                    autoSaveEnabled ? "text-green-600 border-green-300 bg-green-50" : "text-gray-500"
                  )}
                >
                  {autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}
                </Button>
              )}
              
              {/* Preview mode toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                {previewMode ? (
                  <>
                    <Eye className="w-4 h-4" />
                    Edit Mode
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Preview Mode
                  </>
                )}
              </Button>

              {/* Close button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4 mt-4">
            {isDirty && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Form has unsaved changes
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {previewMode ? (
            // Preview mode
            <div className="space-y-6">
              <div className="prose prose-lg max-w-none">
                <div className="flex items-center gap-4 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 m-0">{watchedValues.title}</h1>
                  {watchedValues.isImportant && (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      Important
                    </Badge>
                  )}
                  {watchedValues.isPinned && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      Pinned
                    </Badge>
                  )}
                  {watchedValues.isFeatured && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      Featured
                    </Badge>
                  )}
                </div>
                
                {watchedValues.summary && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2 m-0">Summary</h3>
                    <p className="text-blue-800 m-0">{watchedValues.summary}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTypeIcon(watchedValues.type || 'message')}
                    {TYPE_LABELS[watchedValues.type || 'message']}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTargetAudienceIcon(watchedValues.targetAudience)}
                    {TARGET_AUDIENCE_LABELS[watchedValues.targetAudience]}
                  </Badge>
                  <Badge variant="secondary">
                    {BOARD_TYPE_LABELS[watchedValues.boardType]}
                  </Badge>
                  <Badge className={cn(
                    watchedValues.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                    watchedValues.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    'bg-green-100 text-green-800 border-green-200'
                  )}>
                    {PRIORITY_LABELS[watchedValues.priority]}
                  </Badge>
                  <Badge variant="default">
                    {STATUS_LABELS[watchedValues.status]}
                  </Badge>
                  {watchedValues.sourceGroup && (
                    <Badge variant="outline">
                      Source: {watchedValues.sourceGroup}
                    </Badge>
                  )}
                </div>

                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: watchedValues.content || '<p class="text-gray-500">No content</p>'
                  }}
                />

                {(watchedValues.publishedAt || watchedValues.expiresAt) && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      {watchedValues.publishedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Published: {format(new Date(watchedValues.publishedAt), 'yyyy/MM/dd HH:mm', { locale: zhTW })}</span>
                        </div>
                      )}
                      {watchedValues.expiresAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-500" />
                          <span>Expires: {format(new Date(watchedValues.expiresAt), 'yyyy/MM/dd HH:mm', { locale: zhTW })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Edit mode
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-8">
                {/* Main content area */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                  <div className="xl:col-span-3 space-y-6">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Title *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter communication title"
                              className="text-lg py-3"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Summary */}
                    <FormField
                      control={form.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Summary</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter brief summary (optional)"
                              className="min-h-[80px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Brief description displayed in listings (max 500 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Content */}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Content *</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter detailed communication content..."
                              minHeight={400}
                              maxHeight={800}
                              maxLength={50000}
                              autoSave={autoSaveEnabled && isEditMode}
                              autoSaveInterval={30000}
                              onAutoSave={handleAutoSave}
                              enableImageUpload={true}
                              relatedType={watchedValues.type || 'message'}
                              relatedId={communication?.id}
                              error={errors.content?.message}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription className="flex items-center justify-between">
                            <span>Rich text format supported • Character limit: 50,000</span>
                            {lastAutoSave && isEditMode && (
                              <span className="text-xs text-green-600">
                                Auto-saved: {format(lastAutoSave, 'HH:mm:ss', { locale: zhTW })}
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Settings sidebar */}
                  <div className="xl:col-span-1 space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold text-gray-900">Communication Settings</h3>
                      
                      {/* Type */}
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    <div className="flex items-center gap-2">
                                      {getTypeIcon(value as CommunicationType)}
                                      {label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Source Group */}
                      <FormField
                        control={form.control}
                        name="sourceGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source Group</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(SOURCE_GROUP_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Target Audience */}
                      <FormField
                        control={form.control}
                        name="targetAudience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Audience *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select audience" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(TARGET_AUDIENCE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    <div className="flex items-center gap-2">
                                      {getTargetAudienceIcon(value as TargetAudience)}
                                      {label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Board Type */}
                      <FormField
                        control={form.control}
                        name="boardType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Board Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select board" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(BOARD_TYPE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Priority */}
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="high">🔴 High Priority</SelectItem>
                                <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                                <SelectItem value="low">🟢 Low Priority</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Status */}
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Special Options */}
                    <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold text-blue-900">Special Options</h3>
                      
                      <FormField
                        control={form.control}
                        name="isImportant"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Mark as Important</FormLabel>
                              <FormDescription className="text-xs">Highlights this communication</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isPinned"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Pin to Top</FormLabel>
                              <FormDescription className="text-xs">Shows at the top of lists</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Feature This</FormLabel>
                              <FormDescription className="text-xs">Displays prominently on homepage</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Scheduling */}
                    <div className="bg-green-50 rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold text-green-900">Scheduling</h3>
                      
                      <FormField
                        control={form.control}
                        name="publishedAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Publish Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Leave empty for immediate publish
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="expiresAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Leave empty to never expire
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Form buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading || isSubmitting}
                    className="flex items-center gap-2 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>

                  <div className="flex items-center gap-3">
                    {/* Save draft */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={loading || isSubmitting}
                      className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                    >
                      {loading && watchedValues.status === 'draft' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Draft
                    </Button>

                    {/* Publish/Update */}
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={loading || isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      {loading && watchedValues.status === 'published' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isEditMode ? 'Update Communication' : 'Publish Communication'}
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