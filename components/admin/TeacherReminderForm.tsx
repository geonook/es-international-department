'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CalendarIcon, 
  Clock, 
  Save, 
  X, 
  AlertTriangle,
  Loader2 
} from 'lucide-react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

interface TeacherReminderData {
  id?: number
  title: string
  content: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'active' | 'completed' | 'cancelled' | 'pending'
  dueDate?: string
  dueTime?: string
  targetAudience: 'all' | 'specific_grades' | 'departments'
  reminderType: 'deadline' | 'meeting' | 'task' | 'announcement' | 'general'
  isRecurring: boolean
  recurringPattern?: string
}

interface TeacherReminderFormProps {
  reminder?: TeacherReminderData | null
  onSubmit: (data: TeacherReminderData) => void
  onCancel: () => void
  loading?: boolean
  error?: string
  mode: 'create' | 'edit'
}

export default function TeacherReminderForm({
  reminder,
  onSubmit,
  onCancel,
  loading = false,
  error = '',
  mode
}: TeacherReminderFormProps) {
  const [formData, setFormData] = useState<TeacherReminderData>({
    title: '',
    content: '',
    priority: 'medium',
    status: 'active',
    targetAudience: 'all',
    reminderType: 'general',
    isRecurring: false
  })
  
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Initialize form data
  useEffect(() => {
    if (reminder) {
      setFormData({
        ...reminder,
        dueDate: reminder.dueDate || '',
        dueTime: reminder.dueTime || ''
      })
      if (reminder.dueDate) {
        setSelectedDate(new Date(reminder.dueDate))
      }
    }
  }, [reminder])

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required'
    }

    if (formData.isRecurring && !formData.recurringPattern) {
      errors.recurringPattern = 'Recurring pattern is required when recurring is enabled'
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

    const submitData = {
      ...formData,
      dueDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
    }

    onSubmit(submitData)
  }

  // Handle input changes
  const handleInputChange = (field: keyof TeacherReminderData, value: any) => {
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

  const priorityVariants = {
    low: 'success' as const,
    medium: 'info' as const, 
    high: 'warning' as const,
    urgent: 'destructive' as const
  }

  const statusVariants = {
    active: 'info' as const,
    completed: 'success' as const,
    cancelled: 'outline' as const,
    pending: 'warning' as const
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
              <Clock className="h-6 w-6" />
              {mode === 'create' ? 'Create Teacher Reminder' : 'Edit Teacher Reminder'}
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
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter reminder title"
                    className={formErrors.title ? 'border-red-500' : ''}
                  />
                  {formErrors.title && (
                    <span className="text-sm text-red-500">{formErrors.title}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderType">Type</Label>
                  <Select
                    value={formData.reminderType}
                    onValueChange={(value) => handleInputChange('reminderType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter reminder content"
                  rows={4}
                  className={formErrors.content ? 'border-red-500' : ''}
                />
                {formErrors.content && (
                  <span className="text-sm text-red-500">{formErrors.content}</span>
                )}
              </div>

              {/* Priority and Status */}
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
                          <Badge variant={priorityVariants.low}>Low</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge variant={priorityVariants.medium}>Medium</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge variant={priorityVariants.high}>High</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <Badge variant={priorityVariants.urgent}>Urgent</Badge>
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
                      <SelectItem value="active">
                        <Badge variant={statusVariants.active}>Active</Badge>
                      </SelectItem>
                      <SelectItem value="pending">
                        <Badge variant={statusVariants.pending}>Pending</Badge>
                      </SelectItem>
                      <SelectItem value="completed">
                        <Badge variant={statusVariants.completed}>Completed</Badge>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <Badge variant={statusVariants.cancelled}>Cancelled</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                      <SelectItem value="all">All Teachers</SelectItem>
                      <SelectItem value="specific_grades">Specific Grades</SelectItem>
                      <SelectItem value="departments">Departments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date)
                          setShowCalendar(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueTime">Due Time</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={formData.dueTime || ''}
                    onChange={(e) => handleInputChange('dueTime', e.target.value)}
                  />
                </div>
              </div>

              {/* Recurring Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                  />
                  <Label htmlFor="isRecurring">Recurring Reminder</Label>
                </div>

                {formData.isRecurring && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="recurringPattern">Recurring Pattern</Label>
                    <Select
                      value={formData.recurringPattern || ''}
                      onValueChange={(value) => handleInputChange('recurringPattern', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.recurringPattern && (
                      <span className="text-sm text-red-500">{formErrors.recurringPattern}</span>
                    )}
                  </motion.div>
                )}
              </div>

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
                  {loading ? 'Saving...' : mode === 'create' ? 'Create Reminder' : 'Update Reminder'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}