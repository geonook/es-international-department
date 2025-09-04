'use client'

/**
 * Enhanced Rich Text Editor Component for Teacher Communications
 * 
 * @description Optimized for structured teacher communications like 13-point lists
 * Features: Numbered lists, bold formatting, clickable links, table of contents
 */

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered, 
  Eye, 
  Edit,
  FileText,
  Hash,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Pin,
  Star,
  Target,
  BookOpen,
  Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface EnhancedRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  showPreview?: boolean
  showTableOfContents?: boolean
  contentType?: 'message' | 'announcement' | 'newsletter' | 'reminder'
  sourceGroup?: string
  isTeacherMessage?: boolean
}

interface TableOfContentsItem {
  id: string
  text: string
  level: number
  lineNumber: number
  type: 'numbered' | 'header'
}

// Teacher-specific content templates
const TEACHER_TEMPLATES = {
  message: `**Welcome Message**

1. **Opening Ceremony** - Please gather in the main hall by 8:30 AM on Monday for the welcome ceremony and semester kickoff announcements.

2. **Pick-up Arrangements** - New pick-up protocols are in effect. Please review the updated procedures: [Pick-up Schedule](https://sheets.google.com/example)

3. **Weekly Schedule Updates** - Check the master schedule for any room changes: [Master Schedule](https://sheets.google.com/schedule)

4. **Student Registration Status** - All class rosters have been finalized. Access your updated class lists in the teacher portal.

5. **Curriculum Materials** - New curriculum packets are available in the resource center. Please collect them by Wednesday.

Questions? Please reach out to the main office or your department head.`,
  
  announcement: `**Important Announcement**

Dear Teachers,

**Summary**: Brief overview of the announcement

**Key Points**:
- Main point with important details
- **Action Required**: Specific steps teachers need to take
- **Deadline**: [Date] - Submit materials by this date

**Resources**:
- [Document Link](https://docs.google.com/example) - Reference materials
- [Form Link](https://forms.google.com/example) - Required submission

Contact [Name] for questions.`,

  reminder: `**Important Reminder**

**What**: Brief description of what needs attention
**When**: [Date/Time] - Specific deadline or event time
**Where**: Location or platform details
**Who**: Target audience (all teachers, specific departments)

**Action Items**:
1. **Complete by [Date]** - Specific task description
2. **Submit to [Person/System]** - Submission details
3. **Attend [Event]** - Meeting or training details

**Resources**: [Link](https://example.com) - Supporting materials`,

  newsletter: `**[Department] Newsletter - [Month Year]**

## Highlights This Month

1. **Feature Story** - Major development or achievement
2. **New Initiatives** - Recent program launches or changes
3. **Recognition** - Teacher or student accomplishments

## Important Updates

- **Policy Changes**: Summary of any new policies
- **Schedule Changes**: Upcoming calendar modifications
- **Resource Updates**: New materials or systems available

## Upcoming Events

1. **[Date]** - [Event Name] at [Location]
2. **[Date]** - [Event Name] - [Details]

## Resources & Links

- [Resource Name](https://link.com) - Description
- [Form Name](https://form.com) - When to use

Contact: [Name] at [email] for questions.`
}

export default function EnhancedRichTextEditor({
  value,
  onChange,
  placeholder,
  className = '',
  showPreview = true,
  showTableOfContents = true,
  contentType = 'message',
  sourceGroup,
  isTeacherMessage = false
}: EnhancedRichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [showTOC, setShowTOC] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Update counts when value changes
  useEffect(() => {
    setCharCount(value.length)
    const words = value.trim() ? value.trim().split(/\s+/).length : 0
    setWordCount(words)
  }, [value])

  // Generate table of contents from numbered items and headers
  const tableOfContents = useMemo((): TableOfContentsItem[] => {
    const lines = value.split('\n')
    const toc: TableOfContentsItem[] = []
    
    lines.forEach((line, index) => {
      // Match numbered items: 1. **Text** or 1. Text
      const numberedMatch = line.match(/^(\s*)(\d+)\.\s*\*\*(.*?)\*\*/) || line.match(/^(\s*)(\d+)\.\s*([^*].*)/)
      if (numberedMatch) {
        const [, indent, number, text] = numberedMatch
        const level = Math.floor(indent.length / 2) + 1
        toc.push({
          id: `item-${number}`,
          text: text.trim(),
          level,
          lineNumber: index + 1,
          type: 'numbered'
        })
      }
      
      // Match markdown headers: ## Header
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headerMatch) {
        const [, hashes, text] = headerMatch
        toc.push({
          id: `header-${index}`,
          text: text.trim(),
          level: hashes.length,
          lineNumber: index + 1,
          type: 'header'
        })
      }
    })
    
    return toc
  }, [value])

  // Enhanced content processing for preview
  const processContent = (content: string): string => {
    if (!content) return '<p class="text-gray-500 italic">No content to preview...</p>'
    
    let processed = content
      // Convert bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      
      // Convert italic text: *text* -> <em>text</em>
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em class="italic text-gray-800">$1</em>')
      
      // Convert links: [text](url) -> clickable links with external icon
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
        '<a href="$2" class="text-blue-600 hover:text-blue-800 underline font-medium inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">$1 <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>')
      
      // Convert numbered lists with enhanced teacher-focused styling
      .replace(/^(\s*)(\d+)\.\s*\*\*(.*?)\*\*\s*-?\s*(.*)$/gm, (match, indent, number, boldText, restText) => {
        const level = Math.floor(indent.length / 2)
        const marginLeft = level * 20
        const isHighPriority = parseInt(number) <= 3
        const priorityClass = isHighPriority ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        
        return `<div class="numbered-item flex items-start gap-3 mb-4 p-4 ${priorityClass} rounded-lg border-l-4" style="margin-left: ${marginLeft}px" data-line="${number}">
          <div class="flex-shrink-0 w-8 h-8 ${isHighPriority ? 'bg-blue-600' : 'bg-gray-600'} text-white rounded-full flex items-center justify-center text-sm font-bold">${number}</div>
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-900 mb-1 text-base">${boldText}</h4>
            ${restText.trim() ? `<p class="text-gray-700 text-sm leading-relaxed">${restText.trim()}</p>` : ''}
          </div>
        </div>`
      })
      
      // Convert regular numbered lists without bold headers
      .replace(/^(\s*)(\d+)\.\s*([^*].*)$/gm, (match, indent, number, text) => {
        if (match.includes('**')) return match // Skip if already processed above
        const level = Math.floor(indent.length / 2)
        const marginLeft = level * 20
        return `<div class="numbered-item-simple flex items-start gap-3 mb-3 p-3 bg-white rounded-lg border border-gray-200" style="margin-left: ${marginLeft}px" data-line="${number}">
          <span class="flex-shrink-0 w-7 h-7 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium">${number}</span>
          <p class="flex-1 text-gray-700 leading-relaxed">${text.trim()}</p>
        </div>`
      })
      
      // Convert bullet points
      .replace(/^(\s*)-\s*\*\*(.*?)\*\*\s*-?\s*(.*)$/gm, (match, indent, boldText, restText) => {
        const level = Math.floor(indent.length / 2)
        const marginLeft = level * 20
        return `<div class="bullet-item-bold flex items-start gap-3 mb-2 p-3 bg-yellow-50 rounded-lg border-l-3 border-yellow-400" style="margin-left: ${marginLeft}px">
          <div class="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-3"></div>
          <div class="flex-1">
            <h5 class="font-medium text-gray-900 mb-1">${boldText}</h5>
            ${restText.trim() ? `<p class="text-gray-700 text-sm">${restText.trim()}</p>` : ''}
          </div>
        </div>`
      })
      
      .replace(/^(\s*)-\s*(.*)$/gm, (match, indent, text) => {
        if (match.includes('**')) return match // Skip if already processed above
        const level = Math.floor(indent.length / 2)
        const marginLeft = level * 20
        return `<div class="bullet-item flex items-start gap-2 mb-2" style="margin-left: ${marginLeft}px">
          <span class="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></span>
          <p class="flex-1 text-gray-700">${text.trim()}</p>
        </div>`
      })
      
      // Convert headers
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-900 mb-3 mt-6 border-b border-gray-200 pb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mb-4 mt-8 border-b-2 border-gray-300 pb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mb-6 mt-8">$1</h1>')
      
      // Convert paragraphs and line breaks
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/\n/g, '<br/>')

    // Wrap in paragraph tags if not already structured
    if (!processed.includes('<div class="numbered-item') && !processed.includes('<h') && !processed.includes('<p')) {
      processed = `<p class="mb-4 text-gray-700 leading-relaxed">${processed}</p>`
    }

    return processed
  }

  // Insert formatting at cursor position
  const insertFormatting = (before: string, after: string = '') => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  // Quick insert functions
  const insertBold = () => insertFormatting('**', '**')
  const insertItalic = () => insertFormatting('*', '*')
  const insertLink = () => insertFormatting('[', '](url)')
  const insertNumberedList = () => {
    const currentNumber = (value.match(/^\d+\./gm) || []).length + 1
    insertFormatting(`\n${currentNumber}. **Item Title** - Description`)
  }

  // Insert template
  const insertTemplate = () => {
    const template = TEACHER_TEMPLATES[contentType]
    if (template) {
      onChange(template)
    }
  }

  // Scroll to table of contents item
  const scrollToItem = (item: TableOfContentsItem) => {
    if (!previewRef.current) return
    
    const element = previewRef.current.querySelector(`[data-line="${item.lineNumber}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Get source group info
  const getSourceGroupInfo = (group?: string) => {
    const groups: Record<string, { color: string, icon: any, label: string }> = {
      'Vickie': { color: 'bg-purple-100 text-purple-700', icon: Star, label: 'Principal Vickie' },
      'Matthew': { color: 'bg-indigo-100 text-indigo-700', icon: Star, label: 'Vice Principal Matthew' },
      'Academic Team': { color: 'bg-blue-100 text-blue-700', icon: BookOpen, label: 'Academic Team' },
      'Curriculum Team': { color: 'bg-green-100 text-green-700', icon: FileText, label: 'Curriculum Team' },
      'Instructional Team': { color: 'bg-orange-100 text-orange-700', icon: Target, label: 'Instructional Team' },
    }
    return groups[group || ''] || { color: 'bg-gray-100 text-gray-700', icon: Users, label: 'General' }
  }

  // Get content placeholder based on type
  const getPlaceholder = () => {
    switch (contentType) {
      case 'message':
        return `Enter your structured message board content here. Perfect for teacher communications!

Example format:
**Welcome Message**

1. **Opening Ceremony** - Please gather in the main hall by 8:30 AM
2. **Pick-up Arrangements** - New protocols: [Schedule Link](https://sheets.google.com/example)
3. **Weekly Updates** - Check master schedule for room changes

Tips:
• Use numbered lists (1. 2. 3.) for structured instructions
• Bold important titles with **double asterisks**
• Add clickable links: [Link Text](URL)
• Links to Google Sheets and documents work perfectly`

      case 'announcement':
        return `Enter announcement content here. Use this format for best results:

**Important Announcement**

- **Key Point**: Main information with bold emphasis
- **Action Required**: What teachers need to do
- **Deadline**: [Date] - When it's due

Resources: [Document Link](url) - Additional materials`

      case 'newsletter':
        return `Enter newsletter content here. Structure with:

## Section Headers
1. **Feature Story** - Main news item
2. **Updates** - Recent developments  
3. **Resources** - Links to helpful materials

Use headers (##) and numbered lists for organization.`

      case 'reminder':
        return `Enter reminder content here:

**Important Reminder**

**What**: Brief description
**When**: [Date/Time] 
**Action Items**:
1. **Step One** - Details
2. **Step Two** - More details`

      default:
        return placeholder || 'Start typing your content here...'
    }
  }

  return (
    <div className={`enhanced-rich-text-editor ${className}`}>
      {/* Enhanced Teacher-Focused Toolbar */}
      <div className="mb-4 space-y-3">
        {/* Source Group and Content Type */}
        {isTeacherMessage && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              {sourceGroup && (
                <Badge className={getSourceGroupInfo(sourceGroup).color}>
                  {React.createElement(getSourceGroupInfo(sourceGroup).icon, { className: 'w-4 h-4 mr-1' })}
                  {getSourceGroupInfo(sourceGroup).label}
                </Badge>
              )}
              <Badge variant="outline" className="text-blue-700">
                {contentType === 'message' && '📋 Teacher Message Board'}
                {contentType === 'announcement' && '📢 Teacher Announcement'}
                {contentType === 'newsletter' && '📰 Teacher Newsletter'}
                {contentType === 'reminder' && '⏰ Teacher Reminder'}
              </Badge>
            </div>
          </div>
        )}

        {/* Main Toolbar */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            {/* Formatting Buttons */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={insertBold}
              title="Bold (**text**)"
            >
              <Bold className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={insertItalic}
              title="Italic (*text*)"
            >
              <Italic className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={insertLink}
              title="Link [text](url)"
            >
              <Link className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={insertNumberedList}
              title="Add Numbered Item"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>

            <div className="h-4 w-px bg-gray-300 mx-2" />

            {/* Template Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={insertTemplate}
              title={`Insert ${contentType} template`}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Template
            </Button>
          </div>

          {/* Preview Toggle and TOC */}
          <div className="flex items-center gap-2">
            {showTableOfContents && tableOfContents.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTOC(!showTOC)}
              >
                <FileText className="w-4 h-4 mr-1" />
                Contents ({tableOfContents.length})
              </Button>
            )}
            
            {showPreview && (
              <Button
                type="button"
                variant={isPreview ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? (
                  <>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Table of Contents Sidebar */}
        {showTableOfContents && showTOC && tableOfContents.length > 0 && isPreview && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Table of Contents
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {tableOfContents.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToItem(item)}
                      className={`w-full text-left p-2 rounded text-sm hover:bg-gray-100 transition-colors ${
                        item.level === 1 ? 'font-medium text-gray-900' : 
                        item.level === 2 ? 'text-gray-700 pl-4' : 
                        'text-gray-600 pl-6'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.type === 'numbered' ? (
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded text-xs flex items-center justify-center font-medium">
                            {item.text.match(/^\d+/) ? item.text.match(/^\d+/)![0] : '#'}
                          </span>
                        ) : (
                          <span className="flex-shrink-0 w-5 h-5 bg-gray-100 text-gray-600 rounded text-xs flex items-center justify-center font-medium">
                            H{item.level}
                          </span>
                        )}
                        <span className="truncate">{item.text.replace(/^\d+\.?\s*/, '')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Editor/Preview Content */}
        <div className={`${showTableOfContents && showTOC && tableOfContents.length > 0 && isPreview ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <AnimatePresence mode="wait">
            {isPreview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent 
                    ref={previewRef}
                    className="p-6 min-h-[400px] bg-white"
                  >
                    <div 
                      className="structured-content prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: processContent(value) }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="min-h-[400px] font-mono text-sm resize-none leading-relaxed"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats and Tips */}
          <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>{charCount} characters</span>
              <span>{wordCount} words</span>
              {tableOfContents.length > 0 && (
                <span>{tableOfContents.length} sections</span>
              )}
            </div>
            
            {isTeacherMessage && (
              <Badge variant="outline" className="text-xs">
                Teacher Communication
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content Type Specific Tips */}
      {contentType === 'message' && !isPreview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="text-sm text-blue-800">
            <strong>💡 Teacher Message Board Tips:</strong>
            <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
              <li>Use numbered lists for structured instructions (1. **Title** - Description)</li>
              <li>Add links to Google Sheets: [Schedule](https://sheets.google.com/your-link)</li>
              <li>Bold important text with **double asterisks** for emphasis</li>
              <li>First 3 items get priority styling (blue highlighting)</li>
              <li>Preview mode shows exactly how teachers will see your content</li>
              <li>Table of contents auto-generates from your numbered items</li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  )
}