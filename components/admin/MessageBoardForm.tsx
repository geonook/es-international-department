'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  MessageSquare, 
  Save, 
  X, 
  AlertTriangle,
  Loader2,
  Pin,
  Eye,
  MessageCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MessageBoardData {
  id?: number
  title: string
  content: string
  summary?: string
  targetAudience: 'teachers' | 'parents' | 'all'
  sourceGroup?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  isPinned: boolean
  isImportant: boolean
  status: 'draft' | 'published' | 'archived'
  expiresAt?: string
}

interface MessageBoardFormProps {
  message?: MessageBoardData | null
  onSubmit: (data: MessageBoardData) => void
  onCancel: () => void
  loading?: boolean
  error?: string
  mode: 'create' | 'edit'
}

export default function MessageBoardForm({
  message,
  onSubmit,
  onCancel,
  loading = false,
  error = '',
  mode
}: MessageBoardFormProps) {
  const [formData, setFormData] = useState<MessageBoardData>({
    title: '',
    content: '',
    summary: '',
    targetAudience: 'all',
    sourceGroup: '',
    priority: 'medium',
    isPinned: false,
    isImportant: false,
    status: 'published',
    expiresAt: ''
  })
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Initialize form data
  useEffect(() => {
    if (message) {
      setFormData({
        ...message
      })
    }
  }, [message])

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  // Handle input changes
  const handleInputChange = (field: keyof MessageBoardData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const targetAudienceOptions = [
    { value: 'all', label: 'All Users', description: 'Visible to all teachers and parents' },
    { value: 'teachers', label: 'Teachers Only', description: 'Only visible to teachers and staff' },
    { value: 'parents', label: 'Parents Only', description: 'Only visible to parents and guardians' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low', description: 'General information', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', description: 'Standard announcements', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', description: 'Important updates', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'critical', label: 'Critical', description: 'Urgent notifications', color: 'bg-red-100 text-red-800' }
  ]

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-purple-100 text-purple-800'
  }

  const audienceColors = {
    all: 'bg-blue-100 text-blue-800',
    teachers: 'bg-purple-100 text-purple-800',
    parents: 'bg-pink-100 text-pink-800'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-lg shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-800 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <MessageSquare className="h-6 w-6" />
              {mode === 'create' ? 'Create Message Board Post' : 'Edit Message Board Post'}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter message board post title"
                  className={formErrors.title ? 'border-red-500' : ''}
                />
                {formErrors.title && (
                  <span className="text-sm text-red-500">{formErrors.title}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary (Optional)</Label>
                <Input
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Brief summary for homepage display (max 200 chars)"
                  maxLength={200}
                />
                <span className="text-xs text-gray-500">
                  {formData.summary?.length || 0}/200 characters
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter message board post content"
                  rows={8}
                  className={formErrors.content ? 'border-red-500' : ''}
                />
                {formErrors.content && (
                  <span className="text-sm text-red-500">{formErrors.content}</span>
                )}
              </div>

              {/* Target Audience and Priority */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select
                    value={formData.targetAudience}
                    onValueChange={(value) => handleInputChange('targetAudience', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudienceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Badge className={audienceColors[option.value as keyof typeof audienceColors]}>
                                {option.label}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={option.color}>
                              {option.label}
                            </Badge>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors.draft}>Draft</Badge>
                          <span className="text-xs text-gray-500">Not visible to users</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="published">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors.published}>Published</Badge>
                          <span className="text-xs text-gray-500">Live and visible</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="archived">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors.archived}>Archived</Badge>
                          <span className="text-xs text-gray-500">Hidden from main view</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Source Group and Expiry */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sourceGroup">Source Group (Optional)</Label>
                  <Input
                    id="sourceGroup"
                    value={formData.sourceGroup}
                    onChange={(e) => handleInputChange('sourceGroup', e.target.value)}
                    placeholder="e.g. Academic Team, Administration, Grade 1-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                  />
                  <span className="text-xs text-gray-500">
                    Leave empty for no expiry
                  </span>
                </div>
              </div>

              {/* Pin and Important Options */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="isPinned"
                    checked={formData.isPinned}
                    onCheckedChange={(checked) => handleInputChange('isPinned', checked)}
                  />
                  <Label htmlFor="isPinned" className="flex items-center gap-2">
                    <Pin className="w-4 h-4" />
                    Pin this post to the top
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-yellow-50 rounded-lg">
                  <Checkbox
                    id="isImportant"
                    checked={formData.isImportant}
                    onCheckedChange={(checked) => handleInputChange('isImportant', checked)}
                  />
                  <Label htmlFor="isImportant" className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Mark as important
                  </Label>
                </div>
              </div>

              {/* Preview Section */}
              {(formData.title || formData.content) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                >
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </h4>
                  <div className="space-y-2">
                    <h5 className="font-semibold text-gray-900">{formData.title || 'Untitled Post'}</h5>
                    {formData.summary && (
                      <p className="text-sm text-blue-600 italic">
                        {formData.summary}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {formData.content || 'No content yet...'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={audienceColors[formData.targetAudience]}>
                        {targetAudienceOptions.find(opt => opt.value === formData.targetAudience)?.label}
                      </Badge>
                      <Badge className={priorityOptions.find(opt => opt.value === formData.priority)?.color || 'bg-gray-100 text-gray-800'}>
                        {priorityOptions.find(opt => opt.value === formData.priority)?.label} Priority
                      </Badge>
                      <Badge className={statusColors[formData.status]}>
                        {formData.status}
                      </Badge>
                      {formData.isPinned && (
                        <Badge variant="outline">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {formData.isImportant && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Important
                        </Badge>
                      )}
                      {formData.sourceGroup && (
                        <Badge variant="outline">
                          {formData.sourceGroup}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                  className="px-6"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 bg-gradient-to-r from-indigo-600 to-purple-800 hover:from-indigo-700 hover:to-purple-900"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Update Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}