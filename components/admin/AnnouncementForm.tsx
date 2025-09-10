'use client'

/**
 * Announcement Form Component
 * 
 * @description Form component for creating and editing announcements
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Save, AlertTriangle } from 'lucide-react'
import RichTextEditor from '@/components/ui/rich-text-editor'

interface AnnouncementFormProps {
  announcement?: {
    id: string
    title: string
    content: string
    summary?: string
    targetAudience: 'teachers' | 'parents' | 'all'
    priority: 'high' | 'medium' | 'low'
    status: 'draft' | 'published' | 'archived'
  }
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
}

export default function AnnouncementForm({ 
  announcement, 
  onClose, 
  onSubmit 
}: AnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    summary: announcement?.summary || '',
    targetAudience: announcement?.targetAudience || 'all',
    priority: announcement?.priority || 'medium',
    status: announcement?.status || 'draft'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-bold">
          {announcement ? 'Edit Announcement' : 'Create Announcement'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter announcement title"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Input
            id="summary"
            value={formData.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            placeholder="Brief summary (optional)"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content * (支援富文本格式)</Label>
          <RichTextEditor
            value={formData.content}
            onChange={(content) => handleChange('content', content)}
            placeholder="Enter announcement content with rich formatting..."
            disabled={isSubmitting}
            minHeight={200}
            maxHeight={400}
            showWordCount={true}
            enableImageUpload={true}
            className="border rounded-md"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Select
              value={formData.targetAudience}
              onValueChange={(value) => handleChange('targetAudience', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="targetAudience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="teachers">Teachers</SelectItem>
                <SelectItem value="parents">Parents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange('priority', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {announcement ? 'Update' : 'Create'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}