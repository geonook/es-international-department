/**
 * Page Content Manager Component for KCISLK ESID Info Hub
 * 頁面內容管理組件 - 管理員專用
 * 
 * Manages static text content across various pages that can be edited through the admin interface
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  RefreshCw, 
  Edit, 
  Eye, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Settings,
  Globe,
  Users,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useSystemSettings } from '@/hooks/useSystemSettings'

interface ContentSection {
  id: string
  key: string
  title: string
  description?: string
  content: string
  type: 'text' | 'textarea' | 'email' | 'phone'
  page: string
  section: string
  maxLength?: number
  required?: boolean
}

interface PageContentManagerProps {
  className?: string
  page?: string // Filter by specific page
}

export default function PageContentManager({ className, page }: PageContentManagerProps) {
  const [selectedPage, setSelectedPage] = useState(page || 'teachers')
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [contentSections, setContentSections] = useState<ContentSection[]>([])
  const [editedContent, setEditedContent] = useState<Record<string, string>>({})
  const [lastSaveResult, setLastSaveResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Default content structure for Teachers page
  const defaultTeachersContent: ContentSection[] = [
    // Hero Section
    {
      id: 'teachers_hero_title',
      key: 'teachers_page_hero_title',
      title: '主視覺標題',
      description: 'Teachers 頁面主標題',
      content: 'ESID TEACHERS',
      type: 'text',
      page: 'teachers',
      section: 'hero',
      maxLength: 100,
      required: true
    },
    {
      id: 'teachers_hero_subtitle',
      key: 'teachers_page_hero_subtitle', 
      title: '主視覺副標題',
      description: '描述性文字，說明頁面功能',
      content: 'Your comprehensive professional hub for resources, collaboration, and communication',
      type: 'textarea',
      page: 'teachers',
      section: 'hero',
      maxLength: 500,
      required: true
    },
    
    // ESID Feedback Section
    {
      id: 'teachers_feedback_title',
      key: 'teachers_page_feedback_title',
      title: '意見反饋標題',
      content: 'ESID FEEDBACK',
      type: 'text',
      page: 'teachers',
      section: 'feedback',
      maxLength: 100,
      required: true
    },
    {
      id: 'teachers_feedback_description',
      key: 'teachers_page_feedback_description',
      title: '意見反饋描述',
      content: 'Share your thoughts, suggestions, or encouragement with the management team',
      type: 'textarea',
      page: 'teachers',
      section: 'feedback',
      maxLength: 500,
      required: true
    },
    {
      id: 'teachers_feedback_instructions',
      key: 'teachers_page_feedback_instructions',
      title: '意見反饋說明文字',
      content: 'Your feedback helps us improve and grow together',
      type: 'textarea',
      page: 'teachers',
      section: 'feedback',
      maxLength: 200
    },

    // Information Hub Section  
    {
      id: 'teachers_info_title',
      key: 'teachers_page_info_title',
      title: '資訊中心標題',
      content: 'INFORMATION HUB',
      type: 'text',
      page: 'teachers',
      section: 'information',
      maxLength: 100,
      required: true
    },

    // Essential Documents Section
    {
      id: 'teachers_documents_title',
      key: 'teachers_page_documents_title',
      title: '重要文件標題',
      content: 'ESSENTIAL DOCUMENTS AND SITES',
      type: 'text',
      page: 'teachers',
      section: 'documents',
      maxLength: 100,
      required: true
    },
    {
      id: 'teachers_documents_description',
      key: 'teachers_page_documents_description',
      title: '重要文件描述',
      content: 'Access important documents and resources organized by department',
      type: 'textarea',
      page: 'teachers',
      section: 'documents',
      maxLength: 300,
      required: true
    },

    // Teachers' Bulletin Section
    {
      id: 'teachers_bulletin_title',
      key: 'teachers_page_bulletin_title',
      title: '教師佈告欄標題',
      content: "TEACHERS' BULLETIN",
      type: 'text',
      page: 'teachers',
      section: 'bulletin',
      maxLength: 100,
      required: true
    },
    {
      id: 'teachers_bulletin_description',
      key: 'teachers_page_bulletin_description',
      title: '教師佈告欄描述',
      content: 'Share announcements, activities, and resources with your colleagues',
      type: 'textarea',
      page: 'teachers',
      section: 'bulletin',
      maxLength: 300,
      required: true
    },

    // Parents' Corner Section
    {
      id: 'teachers_parents_title',
      key: 'teachers_page_parents_title',
      title: '家長專區標題',
      content: 'Connect with Parents',
      type: 'text',
      page: 'teachers',
      section: 'parents',
      maxLength: 100,
      required: true
    },
    {
      id: 'teachers_parents_description',
      key: 'teachers_page_parents_description',
      title: '家長專區描述',
      content: "Access the Parents' Corner to stay informed about parent communications and resources",
      type: 'textarea',
      page: 'teachers',
      section: 'parents',
      maxLength: 300,
      required: true
    },

    // Footer Section
    {
      id: 'teachers_footer_contact_email',
      key: 'teachers_page_footer_contact_email',
      title: '頁腳聯絡信箱',
      content: 'teachers@kcislk.ntpc.edu.tw',
      type: 'email',
      page: 'teachers',
      section: 'footer',
      required: true
    },
    {
      id: 'teachers_footer_contact_phone',
      key: 'teachers_page_footer_contact_phone',
      title: '頁腳聯絡電話',
      content: 'Extension: 5678',
      type: 'text',
      page: 'teachers',
      section: 'footer',
      maxLength: 50
    },
    {
      id: 'teachers_footer_quote',
      key: 'teachers_page_footer_quote',
      title: '頁腳引言',
      content: 'Empowering educators through seamless collaboration, comprehensive resources, and continuous professional growth.',
      type: 'textarea',
      page: 'teachers',
      section: 'footer',
      maxLength: 500
    }
  ]

  // Load content sections from system settings
  const loadContentSections = useCallback(async () => {
    setIsLoading(true)
    try {
      // Try to load existing content from system settings
      const response = await fetch('/api/settings?prefix=teachers_page_')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.length > 0) {
          // Map existing settings to content sections
          const existingSections = result.data.map((setting: any) => {
            const defaultSection = defaultTeachersContent.find(s => s.key === setting.key)
            return {
              ...defaultSection,
              content: setting.value || defaultSection?.content || ''
            }
          }).filter(Boolean)
          
          setContentSections(existingSections)
        } else {
          // No existing content, use defaults
          setContentSections(defaultTeachersContent)
        }
      } else {
        // Fallback to default content
        setContentSections(defaultTeachersContent)
      }
    } catch (error) {
      console.error('Error loading content sections:', error)
      setContentSections(defaultTeachersContent)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContentSections()
  }, [loadContentSections])

  const handleEditSection = useCallback((sectionId: string) => {
    const section = contentSections.find(s => s.id === sectionId)
    if (section) {
      setEditedContent(prev => ({
        ...prev,
        [sectionId]: section.content
      }))
      setEditingSection(sectionId)
    }
  }, [contentSections])

  const handleCancelEdit = useCallback(() => {
    setEditingSection(null)
    setEditedContent(prev => {
      const newContent = { ...prev }
      if (editingSection) {
        delete newContent[editingSection]
      }
      return newContent
    })
  }, [editingSection])

  const handleSaveSection = useCallback(async (sectionId: string) => {
    const section = contentSections.find(s => s.id === sectionId)
    const newContent = editedContent[sectionId]
    
    if (!section || newContent === undefined) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: section.key,
          value: newContent,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Update local state
          setContentSections(prev => prev.map(s => 
            s.id === sectionId ? { ...s, content: newContent } : s
          ))
          setEditingSection(null)
          setEditedContent(prev => {
            const newEditedContent = { ...prev }
            delete newEditedContent[sectionId]
            return newEditedContent
          })
          setLastSaveResult('內容更新成功！')
        } else {
          setLastSaveResult('更新失敗：' + (result.error || '未知錯誤'))
        }
      } else {
        setLastSaveResult('更新失敗：伺服器錯誤')
      }
    } catch (error) {
      console.error('Error saving section:', error)
      setLastSaveResult('更新失敗：' + (error instanceof Error ? error.message : '網路錯誤'))
    } finally {
      setIsSaving(false)
    }
  }, [contentSections, editedContent])

  const handleBulkSave = useCallback(async () => {
    if (Object.keys(editedContent).length === 0) return

    setIsSaving(true)
    try {
      const updates = Object.entries(editedContent).map(([sectionId, content]) => {
        const section = contentSections.find(s => s.id === sectionId)
        return section ? { key: section.key, value: content } : null
      }).filter(Boolean)

      const response = await fetch('/api/admin/settings/batch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Update all local sections
          setContentSections(prev => prev.map(s => {
            const newContent = editedContent[s.id]
            return newContent !== undefined ? { ...s, content: newContent } : s
          }))
          setEditingSection(null)
          setEditedContent({})
          setLastSaveResult(`成功更新 ${updates.length} 個內容區塊！`)
        } else {
          setLastSaveResult('批量更新失敗：' + (result.error || '未知錯誤'))
        }
      } else {
        setLastSaveResult('批量更新失敗：伺服器錯誤')
      }
    } catch (error) {
      console.error('Error in bulk save:', error)
      setLastSaveResult('批量更新失敗：' + (error instanceof Error ? error.message : '網路錯誤'))
    } finally {
      setIsSaving(false)
    }
  }, [editedContent, contentSections])

  const groupedSections = contentSections.reduce((acc, section) => {
    if (!acc[section.section]) {
      acc[section.section] = []
    }
    acc[section.section].push(section)
    return acc
  }, {} as Record<string, ContentSection[]>)

  const sectionIcons = {
    hero: Globe,
    feedback: MessageSquare,
    information: Settings,
    documents: FileText,
    bulletin: Users,
    parents: Users,
    footer: Settings
  }

  const sectionLabels = {
    hero: '主視覺區域',
    feedback: '意見反饋',
    information: '資訊中心',
    documents: '重要文件',
    bulletin: '教師佈告欄',
    parents: '家長專區',
    footer: '頁腳資訊'
  }

  return (
    <Card className={`bg-white/90 backdrop-blur-lg shadow-lg border-0 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          頁面內容管理 - Teachers 頁面
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 載入狀態 */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">載入內容中...</span>
            </div>
          </div>
        )}

        {/* 保存結果顯示 */}
        {lastSaveResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant={lastSaveResult.includes('失敗') ? 'destructive' : 'default'}>
              {lastSaveResult.includes('失敗') ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{lastSaveResult}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* 批量操作按鈕 */}
        {Object.keys(editedContent).length > 0 && (
          <motion.div 
            className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              onClick={handleBulkSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '保存中...' : `保存所有更改 (${Object.keys(editedContent).length})`}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingSection(null)
                setEditedContent({})
              }}
              disabled={isSaving}
            >
              取消所有更改
            </Button>
          </motion.div>
        )}

        {/* 內容區塊 */}
        {!isLoading && (
          <Tabs value={selectedPage} onValueChange={setSelectedPage} className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="teachers">Teachers 頁面</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teachers" className="space-y-6 mt-6">
              {Object.entries(groupedSections).map(([sectionKey, sections]) => {
                const SectionIcon = sectionIcons[sectionKey as keyof typeof sectionIcons] || Settings
                const sectionLabel = sectionLabels[sectionKey as keyof typeof sectionLabels] || sectionKey
                
                return (
                  <Card key={sectionKey} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <SectionIcon className="w-5 h-5 text-gray-600" />
                        {sectionLabel}
                        <Badge variant="outline" className="ml-auto">
                          {sections.length} 項目
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {sections.map((section) => (
                        <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{section.title}</h4>
                              {section.description && (
                                <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {section.type}
                              </Badge>
                              {section.required && (
                                <Badge variant="destructive" className="text-xs">
                                  必填
                                </Badge>
                              )}
                            </div>
                          </div>

                          {editingSection === section.id ? (
                            <div className="space-y-3">
                              {section.type === 'textarea' ? (
                                <Textarea
                                  value={editedContent[section.id] || section.content}
                                  onChange={(e) => setEditedContent(prev => ({
                                    ...prev,
                                    [section.id]: e.target.value
                                  }))}
                                  maxLength={section.maxLength}
                                  rows={4}
                                  className="resize-none"
                                />
                              ) : (
                                <Input
                                  type={section.type}
                                  value={editedContent[section.id] || section.content}
                                  onChange={(e) => setEditedContent(prev => ({
                                    ...prev,
                                    [section.id]: e.target.value
                                  }))}
                                  maxLength={section.maxLength}
                                />
                              )}
                              
                              {section.maxLength && (
                                <div className="flex justify-end">
                                  <span className="text-xs text-gray-500">
                                    {(editedContent[section.id] || section.content).length} / {section.maxLength}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveSection(section.id)}
                                  disabled={isSaving}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  保存
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  disabled={isSaving}
                                >
                                  取消
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="p-3 bg-gray-50 rounded border">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {section.content || <span className="text-gray-400 italic">空白內容</span>}
                                </p>
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditSection(section.id)}
                                  className="gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  編輯
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
          </Tabs>
        )}

        {/* 使用說明 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="text-sm font-medium text-blue-900 mb-2">使用說明</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 點擊「編輯」按鈕修改內容</li>
            <li>• 必填項目必須有內容才能保存</li>
            <li>• 支援批量編輯和保存</li>
            <li>• 修改後立即生效於對應頁面</li>
            <li>• 建議定期備份重要內容</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}