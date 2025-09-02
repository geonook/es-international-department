'use client'

/**
 * AnnouncementForm Component
 * Form component for creating and editing announcements
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

// Simplified HTML sanitization function
const sanitizeHtml = (html: string) => {
  // Basic HTML sanitization, remove dangerous tags
  return html.replace(/<script[^>]*>.*?<\/script>/gi, '')
             .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
             .replace(/javascript:/gi, '')
             .replace(/on\w+=/gi, '')
}

const extractTextFromHtml = (html: string) => {
  // Extract plain text from HTML
  return html.replace(/<[^>]*>/g, '').trim()
}

// Form validation schema
const announcementSchema = z.object({
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
  targetAudience: z.enum(['teachers', 'parents', 'all'], {
    required_error: 'Please select target audience'
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select priority level'
  }),
  status: z.enum(['draft', 'published', 'archived'], {
    required_error: 'Please select status'
  }),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional()
}).refine((data) => {
  // If publish time and expiry time are set, ensure expiry time is later than publish time
  if (data.publishedAt && data.expiresAt) {
    return new Date(data.expiresAt) > new Date(data.publishedAt)
  }
  return true
}, {
  message: 'Expiry time must be later than publish time',
  path: ['expiresAt']
}).refine((data) => {
  // If status is published, ensure publish time is set
  if (data.status === 'published' && !data.publishedAt) {
    return false
  }
  return true
}, {
  message: 'Publish time must be set when publishing announcement',
  path: ['publishedAt']
})

type FormData = z.infer<typeof announcementSchema>

// Image upload type definitions
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

  // Initialize form
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
      // Sanitize HTML content
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

  // Handle draft saving
  const handleSaveDraft = async () => {
    const data = form.getValues()
    data.status = 'draft'
    // Generate summary (if not manually entered)
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
    // Generate summary (if not manually entered)
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
    if (!autoSaveEnabled || !isDirty) return
    
    try {
      // Only auto-save drafts in edit mode
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


  // Get target audience icon
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
                {isEditMode ? 'Edit Announcement' : 'Create Announcement'}
              </CardTitle>
              {isEditMode && (
                <p className="text-sm text-gray-600 mt-1">
                  Announcement ID: {announcement.id}
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
                    "flex items-center gap-2 text-xs",
                    autoSaveEnabled ? "text-green-600 border-green-300" : "text-gray-500"
                  )}
                  title={autoSaveEnabled ? 'Disable auto-save' : 'Enable auto-save'}
                >
                  {autoSaveEnabled ? 'Auto-save' : 'Manual save'}
                </Button>
              )}
              
              {/* Preview mode toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2"
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
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Status indicator */}
          {isDirty && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Form has unsaved changes
              </AlertDescription>
            </Alert>
          )}

          {/* Error messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        </CardHeader>

        <CardContent>
          {previewMode ? (
            // Preview mode
            <div className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h1 className="text-2xl font-bold mb-4">{watchedValues.title}</h1>
                
                {watchedValues.summary && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Summary</h3>
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
                    __html: watchedValues.content || '<p>No content</p>'
                  }}
                />

                {(watchedValues.publishedAt || watchedValues.expiresAt) && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      {watchedValues.publishedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Published: {format(new Date(watchedValues.publishedAt), 'yyyy/MM/dd HH:mm', { locale: zhTW })}</span>
                        </div>
                      )}
                      {watchedValues.expiresAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
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
              <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
                {/* Basic information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter announcement title"
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
                          <FormLabel>Summary</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter announcement summary (optional)"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Brief description of the announcement content, will be displayed in the announcement list
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
                          <FormLabel>Content *</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter detailed announcement content..."
                              minHeight={300}
                              maxHeight={600}
                              maxLength={50000}
                              autoSave={autoSaveEnabled && isEditMode}
                              autoSaveInterval={30000} // Auto-save every 30 seconds
                              onAutoSave={handleAutoSave}
                              enableImageUpload={true}
                              relatedType="announcement"
                              relatedId={announcement?.id}
                              error={errors.content?.message}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription className="flex items-center justify-between">
                            <span>Supports rich text format, image upload, character limit: 50000 characters</span>
                            {lastAutoSave && isEditMode && (
                              <span className="text-xs text-green-600">
                                Last auto-saved: {format(lastAutoSave, 'HH:mm:ss', { locale: zhTW })}
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Settings panel */}
                  <div className="space-y-4">
                    {/* Target audience */}
                    <FormField
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select target audience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  Everyone
                                </div>
                              </SelectItem>
                              <SelectItem value="teachers">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4" />
                                  Teachers
                                </div>
                              </SelectItem>
                              <SelectItem value="parents">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Parents
                                </div>
                              </SelectItem>
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
                              <SelectItem value="high">High Priority</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low Priority</SelectItem>
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
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Publish time */}
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
                          <FormDescription>
                            Leave empty to use current time
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Expiry time */}
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
                          <FormDescription>
                            Leave empty to never expire
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Form buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading || isSubmitting}
                  >
                    Cancel
                  </Button>

                  <div className="flex items-center gap-2">
                    {/* Save draft */}
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
                      Save Draft
                    </Button>

                    {/* Publish/Update */}
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
                      {isEditMode ? 'Update Announcement' : 'Publish Announcement'}
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