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
  User,
  UserCheck,
  Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FeedbackFormData {
  id?: number
  subject: string
  message: string
  category?: string
  priority: 'low' | 'medium' | 'high'
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  isAnonymous: boolean
  authorName?: string
  authorEmail?: string
  assignedTo?: string
  response?: string
}

interface FeedbackFormProps {
  feedback?: FeedbackFormData | null
  onSubmit: (data: FeedbackFormData) => void
  onCancel: () => void
  loading?: boolean
  error?: string
  mode: 'create' | 'edit'
  availableAssignees?: Array<{
    id: string
    email: string
    displayName?: string
    firstName?: string
    lastName?: string
  }>
}

export default function FeedbackForm({
  feedback,
  onSubmit,
  onCancel,
  loading = false,
  error = '',
  mode,
  availableAssignees = []
}: FeedbackFormProps) {
  const [formData, setFormData] = useState<FeedbackFormData>({
    subject: '',
    message: '',
    category: '',
    priority: 'medium',
    status: 'new',
    isAnonymous: false,
    authorName: '',
    authorEmail: '',
    assignedTo: '',
    response: ''
  })
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Initialize form data
  useEffect(() => {
    if (feedback) {
      setFormData({
        ...feedback,
        category: feedback.category || '',
        authorName: feedback.authorName || '',
        authorEmail: feedback.authorEmail || '',
        assignedTo: feedback.assignedTo || '',
        response: feedback.response || ''
      })
    }
  }, [feedback])

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required'
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required'
    }

    if (formData.isAnonymous && !formData.authorName?.trim()) {
      errors.authorName = 'Name is required for anonymous feedback'
    }

    if (formData.isAnonymous && !formData.authorEmail?.trim()) {
      errors.authorEmail = 'Email is required for anonymous feedback'
    }

    if (formData.isAnonymous && formData.authorEmail?.trim() && !isValidEmail(formData.authorEmail)) {
      errors.authorEmail = 'Please enter a valid email address'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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
  const handleInputChange = (field: keyof FeedbackFormData, value: any) => {
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

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800'
  }

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  }

  const categoryOptions = [
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'appreciation', label: 'Appreciation' },
    { value: 'question', label: 'Question' },
    { value: 'bug_report', label: 'Bug Report' },
    { value: 'feature_request', label: 'Feature Request' }
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-lg shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-800 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <MessageSquare className="h-6 w-6" />
              {mode === 'create' ? 'Create Feedback Form' : 'Edit Feedback Form'}
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
              {/* Anonymous Feedback Toggle */}
              <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => handleInputChange('isAnonymous', checked)}
                />
                <Label htmlFor="isAnonymous" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Submit as anonymous feedback
                </Label>
              </div>

              {/* Anonymous User Information */}
              {formData.isAnonymous && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="authorName">Name *</Label>
                    <Input
                      id="authorName"
                      value={formData.authorName || ''}
                      onChange={(e) => handleInputChange('authorName', e.target.value)}
                      placeholder="Enter your name"
                      className={formErrors.authorName ? 'border-red-500' : ''}
                    />
                    {formErrors.authorName && (
                      <span className="text-sm text-red-500">{formErrors.authorName}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authorEmail">Email *</Label>
                    <Input
                      id="authorEmail"
                      type="email"
                      value={formData.authorEmail || ''}
                      onChange={(e) => handleInputChange('authorEmail', e.target.value)}
                      placeholder="Enter your email"
                      className={formErrors.authorEmail ? 'border-red-500' : ''}
                    />
                    {formErrors.authorEmail && (
                      <span className="text-sm text-red-500">{formErrors.authorEmail}</span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Enter feedback subject"
                    className={formErrors.subject ? 'border-red-500' : ''}
                  />
                  {formErrors.subject && (
                    <span className="text-sm text-red-500">{formErrors.subject}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category || ''}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Enter your feedback message"
                  rows={6}
                  className={formErrors.message ? 'border-red-500' : ''}
                />
                {formErrors.message && (
                  <span className="text-sm text-red-500">{formErrors.message}</span>
                )}
              </div>

              {/* Priority, Status, Assignment */}
              <div className="grid md:grid-cols-3 gap-6">
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
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge className={priorityColors.low}>Low</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge className={priorityColors.medium}>Medium</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge className={priorityColors.high}>High</Badge>
                        </div>
                      </SelectItem>
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
                      <SelectItem value="new">
                        <Badge className={statusColors.new}>New</Badge>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <Badge className={statusColors.in_progress}>In Progress</Badge>
                      </SelectItem>
                      <SelectItem value="resolved">
                        <Badge className={statusColors.resolved}>Resolved</Badge>
                      </SelectItem>
                      <SelectItem value="closed">
                        <Badge className={statusColors.closed}>Closed</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Select
                    value={formData.assignedTo || ''}
                    onValueChange={(value) => handleInputChange('assignedTo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        <span className="text-gray-500">Unassigned</span>
                      </SelectItem>
                      {availableAssignees.map((assignee) => (
                        <SelectItem key={assignee.id} value={assignee.id}>
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            {assignee.displayName || `${assignee.firstName} ${assignee.lastName}` || assignee.email}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Response (for editing mode) */}
              {mode === 'edit' && (
                <div className="space-y-2">
                  <Label htmlFor="response" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Response
                  </Label>
                  <Textarea
                    id="response"
                    value={formData.response || ''}
                    onChange={(e) => handleInputChange('response', e.target.value)}
                    placeholder="Enter response to this feedback"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">This response will be visible to the feedback submitter</p>
                </div>
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
                  className="px-6 bg-gradient-to-r from-purple-600 to-pink-800 hover:from-purple-700 hover:to-pink-900"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : mode === 'create' ? 'Create Feedback' : 'Update Feedback'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}