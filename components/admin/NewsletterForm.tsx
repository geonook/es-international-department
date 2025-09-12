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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CalendarIcon, 
  FileText, 
  Save, 
  X, 
  AlertTriangle,
  Loader2,
  Image,
  Upload
} from 'lucide-react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

interface NewsletterData {
  id?: number
  title: string
  content: string
  htmlContent?: string
  coverImageUrl?: string
  pdfUrl?: string
  embedCode?: string
  status: 'draft' | 'published' | 'archived'
  issueNumber?: number
  publicationDate?: string
}

interface NewsletterFormProps {
  newsletter?: NewsletterData | null
  onSubmit: (data: NewsletterData) => void
  onCancel: () => void
  loading?: boolean
  error?: string
  mode: 'create' | 'edit'
}

export default function NewsletterForm({
  newsletter,
  onSubmit,
  onCancel,
  loading = false,
  error = '',
  mode
}: NewsletterFormProps) {
  const [formData, setFormData] = useState<NewsletterData>({
    title: '',
    content: '',
    htmlContent: '',
    coverImageUrl: '',
    pdfUrl: '',
    embedCode: '',
    status: 'draft',
    issueNumber: undefined,
    publicationDate: undefined
  })
  
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Initialize form data
  useEffect(() => {
    if (newsletter) {
      setFormData({
        ...newsletter,
        publicationDate: newsletter.publicationDate || undefined
      })
      if (newsletter.publicationDate) {
        setSelectedDate(new Date(newsletter.publicationDate))
      }
    }
  }, [newsletter])

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required'
    }

    if (formData.issueNumber && formData.issueNumber < 1) {
      errors.issueNumber = 'Issue number must be a positive integer'
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
      publicationDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
    }

    onSubmit(submitData)
  }

  // Handle input changes
  const handleInputChange = (field: keyof NewsletterData, value: any) => {
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

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800'
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
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-800 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <FileText className="h-6 w-6" />
              {mode === 'create' ? 'Create Newsletter' : 'Edit Newsletter'}
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
                    placeholder="Enter newsletter title"
                    className={formErrors.title ? 'border-red-500' : ''}
                  />
                  {formErrors.title && (
                    <span className="text-sm text-red-500">{formErrors.title}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueNumber">Issue Number</Label>
                  <Input
                    id="issueNumber"
                    type="number"
                    min="1"
                    value={formData.issueNumber || ''}
                    onChange={(e) => handleInputChange('issueNumber', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 1, 2, 3..."
                    className={formErrors.issueNumber ? 'border-red-500' : ''}
                  />
                  {formErrors.issueNumber && (
                    <span className="text-sm text-red-500">{formErrors.issueNumber}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter newsletter content"
                  rows={6}
                  className={formErrors.content ? 'border-red-500' : ''}
                />
                {formErrors.content && (
                  <span className="text-sm text-red-500">{formErrors.content}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="htmlContent">HTML Content (Optional)</Label>
                <Textarea
                  id="htmlContent"
                  value={formData.htmlContent || ''}
                  onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                  placeholder="Enter HTML formatted content (optional)"
                  rows={4}
                />
                <p className="text-xs text-gray-500">For advanced formatting, you can provide HTML content here</p>
              </div>

              {/* Cover Image and Status */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coverImageUrl"
                      value={formData.coverImageUrl || ''}
                      onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.coverImageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.coverImageUrl}
                        alt="Cover preview"
                        className="w-32 h-24 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
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
                        </div>
                      </SelectItem>
                      <SelectItem value="published">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors.published}>Published</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="archived">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors.archived}>Archived</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* PDF URL */}
              <div className="space-y-2">
                <Label htmlFor="pdfUrl">PDF URL (Homepage Display)</Label>
                <div className="flex gap-2">
                  <Input
                    id="pdfUrl"
                    value={formData.pdfUrl || ''}
                    onChange={(e) => handleInputChange('pdfUrl', e.target.value)}
                    placeholder="https://example.com/newsletter.pdf"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  PDF link for "View Latest Newsletter" button on homepage
                </p>
              </div>

              {/* Embed Code */}
              <div className="space-y-2">
                <Label htmlFor="embedCode">Iframe Embed Code (嵌入程式碼)</Label>
                <Textarea
                  id="embedCode"
                  value={formData.embedCode || ''}
                  onChange={(e) => handleInputChange('embedCode', e.target.value)}
                  placeholder='<iframe style="width:900px;height:500px" src="https://online.pubhtml5.com/..." seamless="seamless" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true"></iframe>'
                  rows={4}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-500">
                  貼上完整的 iframe 嵌入程式碼（如 PubHTML5 提供的程式碼）
                </p>
                {formData.embedCode && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Iframe Preview:</p>
                    <div dangerouslySetInnerHTML={{ __html: formData.embedCode }} className="w-full" />
                  </div>
                )}
              </div>

              {/* Publication Date */}
              <div className="space-y-2">
                <Label>Publication Date</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full md:w-auto justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Select publication date'}
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
                <p className="text-xs text-gray-500">Leave blank for drafts</p>
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
                  className="px-6 bg-gradient-to-r from-blue-600 to-purple-800 hover:from-blue-700 hover:to-purple-900"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : mode === 'create' ? 'Create Newsletter' : 'Update Newsletter'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}