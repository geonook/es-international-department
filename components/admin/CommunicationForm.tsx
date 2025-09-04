'use client'

/**
 * Communication Form Component
 * 
 * @description Unified form component for creating and editing communications (announcements, messages, newsletters)
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Save, AlertTriangle } from 'lucide-react'

interface Communication {
  id?: string | number
  title: string
  content: string
  summary?: string
  type?: 'announcement' | 'message' | 'newsletter' | 'reminder'
  targetAudience?: 'teachers' | 'parents' | 'all'
  priority?: 'high' | 'medium' | 'low'
  status?: 'draft' | 'published' | 'archived'
  sourceGroup?: string
  isImportant?: boolean
  isPinned?: boolean
  publishedAt?: string
  expiresAt?: string
}

interface CommunicationFormProps {
  communication?: Communication
  mode?: 'create' | 'edit'
  defaultType?: 'announcement' | 'message' | 'newsletter' | 'reminder'
  onCancel: () => void
  onSubmit: (data: Communication) => Promise<void>
}

export default function CommunicationForm({ 
  communication, 
  mode = 'create',
  defaultType = 'announcement',
  onCancel, 
  onSubmit 
}: CommunicationFormProps) {
  const [formData, setFormData] = useState<Communication>({
    title: communication?.title || '',
    content: communication?.content || '',
    summary: communication?.summary || '',
    type: communication?.type || defaultType,
    targetAudience: communication?.targetAudience || 'all',
    priority: communication?.priority || 'medium',
    status: communication?.status || 'draft',
    sourceGroup: communication?.sourceGroup || '',
    isImportant: communication?.isImportant || false,
    isPinned: communication?.isPinned || false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.content.trim()) {
        throw new Error('Content is required')
      }

      await onSubmit(formData)
      onCancel() // Close form on success
    } catch (error) {
      console.error('Error submitting communication:', error)
      setError(error instanceof Error ? error.message : 'Failed to save communication')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof Communication, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">
          {mode === 'edit' ? 'Edit Communication' : 'Create Communication'}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => handleChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select communication type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="message">Message</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter communication title"
            required
          />
        </div>

        <div>
          <Label htmlFor="summary">Summary</Label>
          <Input
            id="summary"
            value={formData.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            placeholder="Brief summary (optional)"
          />
        </div>

        <div>
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Enter communication content"
            className="min-h-32"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Select 
              value={formData.targetAudience} 
              onValueChange={(value) => handleChange('targetAudience', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="teachers">Teachers Only</SelectItem>
                <SelectItem value="parents">Parents Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}