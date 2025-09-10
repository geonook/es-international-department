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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Save, AlertTriangle, Eye, Edit, List, FileText, Link, Bold, Italic, Underline, Star, Pin, Users, Target, BookOpen } from 'lucide-react'
import EnhancedRichTextEditor from '@/components/ui/enhanced-rich-text-editor'

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
  // Teacher-specific message board properties
  boardType?: 'teachers' | 'parents' | 'general'
  isFeatured?: boolean
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
    isPinned: communication?.isPinned || false,
    boardType: communication?.boardType || 'general',
    isFeatured: communication?.isFeatured || false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [useEnhancedEditor, setUseEnhancedEditor] = useState(true)

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

  // Source group options for teachers
  const sourceGroupOptions = [
    { value: '', label: 'General', icon: Users, color: 'bg-gray-100 text-gray-700' },
    { value: 'Vickie', label: 'Principal Vickie', icon: Star, color: 'bg-purple-100 text-purple-700' },
    { value: 'Matthew', label: 'Vice Principal Matthew', icon: Star, color: 'bg-indigo-100 text-indigo-700' },
    { value: 'Academic Team', label: 'Academic Team', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
    { value: 'Curriculum Team', label: 'Curriculum Team', icon: FileText, color: 'bg-green-100 text-green-700' },
    { value: 'Instructional Team', label: 'Instructional Team', icon: Target, color: 'bg-orange-100 text-orange-700' }
  ]

  const getContentPlaceholder = (type?: string) => {
    switch (type) {
      case 'message':
        return `Enter your message board content here. You can use:

1. Numbered lists for structured instructions
2. Links: [Link text](https://example.com)
3. Bold text: **important text**

Example structure:
1. Opening Ceremony - Important announcements
2. Pick-up Arrangements - Location and time details
3. Weekly Schedule - Links to Google Sheets or documents

Supports links to Google Sheets, documents, and other resources.`
      case 'announcement':
        return 'Enter announcement content here...'
      case 'newsletter':
        return 'Enter newsletter content here...'
      case 'reminder':
        return 'Enter reminder content here...'
      default:
        return 'Enter content here...'
    }
  }

  // Get source group info
  const getSourceGroupInfo = (value: string) => {
    return sourceGroupOptions.find(option => option.value === value) || sourceGroupOptions[0]
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
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="content">Content *</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={useEnhancedEditor ? "default" : "outline"}
                size="sm"
                onClick={() => setUseEnhancedEditor(!useEnhancedEditor)}
              >
                {useEnhancedEditor ? '🚀 Enhanced' : '📝 Simple'}
              </Button>
            </div>
          </div>
          
          {useEnhancedEditor ? (
            <EnhancedRichTextEditor
              value={formData.content}
              onChange={(content) => handleChange('content', content)}
              contentType={formData.type}
              sourceGroup={formData.sourceGroup}
              isTeacherMessage={formData.targetAudience === 'teachers' || formData.type === 'message'}
              showPreview={true}
              showTableOfContents={true}
            />
          ) : (
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder={getContentPlaceholder(formData.type)}
              className="min-h-40 font-mono text-sm"
              required
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectItem value="low">📘 Low Priority</SelectItem>
                <SelectItem value="medium">📙 Medium Priority</SelectItem>
                <SelectItem value="high">📕 High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sourceGroup">Source Group</Label>
            <Select 
              value={formData.sourceGroup} 
              onValueChange={(value) => handleChange('sourceGroup', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source group" />
              </SelectTrigger>
              <SelectContent>
                {sourceGroupOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <SelectItem value="draft">📝 Draft</SelectItem>
                <SelectItem value="published">📢 Published</SelectItem>
                <SelectItem value="archived">📦 Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Special Options for Teachers */}
          {formData.targetAudience === 'teachers' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={formData.isImportant}
                    onChange={(e) => handleChange('isImportant', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="isImportant" className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-red-500" />
                    High Importance
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => handleChange('isPinned', e.target.checked)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <Label htmlFor="isPinned" className="flex items-center gap-2 text-sm">
                    <Pin className="w-4 h-4 text-amber-500" />
                    Pin to Top
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Parents' Corner Sync Configuration - COMMENTED OUT DUE TO UNDEFINED VARIABLES
        {showParentsSync && formData.syncToParents && (
          <div className="space-y-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-pink-600" />
              <h4 className="font-medium text-pink-800">Parents' Corner Sync Settings</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentsCategory">Parents' Corner Category</Label>
                <Select 
                  value={formData.parentsCategory} 
                  onValueChange={(value) => handleChange('parentsCategory', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">📢 General Information</SelectItem>
                    <SelectItem value="events">🎉 Events & Activities</SelectItem>
                    <SelectItem value="academic">📚 Academic Updates</SelectItem>
                    <SelectItem value="safety">🛡️ Safety & Health</SelectItem>
                    <SelectItem value="calendar">📅 Schedule & Calendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            Parents Preview
            {parentsPreview && (
              <div>
                <Label className="text-sm font-medium text-pink-800 mb-2 block">
                  Preview for Parents' Corner
                </Label>
                <div className="p-3 bg-white rounded border border-pink-200 max-h-32 overflow-y-auto">
                  <div 
                    className="text-sm text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: parentsPreview.replace(/\n/g, '<br/>') }}
                  />
                </div>
                <p className="text-xs text-pink-600 mt-1">
                  ✨ Content automatically formatted for family viewing
                </p>
              </div>
            )}

            <div className="text-sm text-pink-700">
              <p>When published, this message will also appear in Parents' Corner with:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Family-friendly language adjustments</li>
                <li>Removal of teacher-specific internal references</li>
                <li>Addition of parent-focused context and notes</li>
              </ul>
            </div>
          </div>
        )}
        */}

        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-gray-600">
            {/* Sync status indicator - COMMENTED OUT DUE TO UNDEFINED VARIABLES
            {formData.syncToParents && (
              <div className="flex items-center gap-2 text-pink-600">
                <Heart className="w-4 h-4" />
                <span>Will sync to Parents' Corner</span>
              </div>
            )}
            */}
          </div>
          <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
          </Button>
          </div>
        </div>
      </form>
    </div>
  )
}