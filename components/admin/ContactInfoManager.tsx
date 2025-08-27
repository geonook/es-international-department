/**
 * Contact Information Manager Component for KCISLK ESID Info Hub
 * 聯絡資訊管理組件 - 管理員專用
 * 
 * Manages contact information across various pages and sections
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
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Users,
  Building,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSystemSettings } from '@/hooks/useSystemSettings'

interface ContactInfo {
  id: string
  key: string
  label: string
  value: string
  type: 'email' | 'phone' | 'address' | 'website' | 'hours' | 'text'
  department: 'general' | 'teachers' | 'parents' | 'admin' | 'emergency'
  displayLocation: string[]
  isPublic: boolean
  order: number
  description?: string
}

interface ContactInfoManagerProps {
  className?: string
  department?: string
}

export default function ContactInfoManager({ className, department }: ContactInfoManagerProps) {
  const [selectedDepartment, setSelectedDepartment] = useState(department || 'general')
  const [editingContact, setEditingContact] = useState<string | null>(null)
  const [contactInfoList, setContactInfoList] = useState<ContactInfo[]>([])
  const [editedContact, setEditedContact] = useState<Partial<ContactInfo>>({})
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [lastSaveResult, setLastSaveResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Default contact information structure
  const defaultContacts: ContactInfo[] = [
    // General School Information
    {
      id: 'general_main_email',
      key: 'contact_general_main_email',
      label: '學校主要信箱',
      value: 'info@kcislk.ntpc.edu.tw',
      type: 'email',
      department: 'general',
      displayLocation: ['footer', 'contact_page', 'header'],
      isPublic: true,
      order: 1,
      description: '學校官方聯絡信箱'
    },
    {
      id: 'general_main_phone',
      key: 'contact_general_main_phone',
      label: '學校主要電話',
      value: '(02) 2603-1588',
      type: 'phone',
      department: 'general',
      displayLocation: ['footer', 'contact_page', 'header'],
      isPublic: true,
      order: 2,
      description: '學校總機電話'
    },
    {
      id: 'general_address',
      key: 'contact_general_address',
      label: '學校地址',
      value: '新北市林口區麗園二街75號',
      type: 'address',
      department: 'general',
      displayLocation: ['footer', 'contact_page'],
      isPublic: true,
      order: 3,
      description: '學校完整地址'
    },
    {
      id: 'general_office_hours',
      key: 'contact_general_office_hours',
      label: '辦公時間',
      value: 'Monday - Friday: 8:00 AM - 5:00 PM',
      type: 'hours',
      department: 'general',
      displayLocation: ['footer', 'contact_page'],
      isPublic: true,
      order: 4,
      description: '學校辦公室開放時間'
    },

    // Teachers Department
    {
      id: 'teachers_email',
      key: 'contact_teachers_email',
      label: '教師部信箱',
      value: 'teachers@kcislk.ntpc.edu.tw',
      type: 'email',
      department: 'teachers',
      displayLocation: ['teachers_page', 'footer'],
      isPublic: true,
      order: 1,
      description: '教師專用聯絡信箱'
    },
    {
      id: 'teachers_phone',
      key: 'contact_teachers_phone',
      label: '教師部電話',
      value: 'Extension: 5678',
      type: 'phone',
      department: 'teachers',
      displayLocation: ['teachers_page', 'footer'],
      isPublic: true,
      order: 2,
      description: '教師部直線電話'
    },

    // Parents Department
    {
      id: 'parents_email',
      key: 'contact_parents_email',
      label: '家長部信箱',
      value: 'parents@kcislk.ntpc.edu.tw',
      type: 'email',
      department: 'parents',
      displayLocation: ['parents_page', 'footer'],
      isPublic: true,
      order: 1,
      description: '家長專用聯絡信箱'
    },
    {
      id: 'parents_phone',
      key: 'contact_parents_phone',
      label: '家長部電話',
      value: 'Extension: 1234',
      type: 'phone',
      department: 'parents',
      displayLocation: ['parents_page', 'footer'],
      isPublic: true,
      order: 2,
      description: '家長部直線電話'
    },

    // Admin Department
    {
      id: 'admin_email',
      key: 'contact_admin_email',
      label: '管理部信箱',
      value: 'admin@kcislk.ntpc.edu.tw',
      type: 'email',
      department: 'admin',
      displayLocation: ['admin_page'],
      isPublic: false,
      order: 1,
      description: '管理部門聯絡信箱'
    },

    // Emergency Contacts
    {
      id: 'emergency_phone',
      key: 'contact_emergency_phone',
      label: '緊急聯絡電話',
      value: '(02) 2603-1588 ext. 911',
      type: 'phone',
      department: 'emergency',
      displayLocation: ['all_pages'],
      isPublic: true,
      order: 1,
      description: '24小時緊急聯絡電話'
    }
  ]

  // Load contact information from system settings
  const loadContactInfo = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings?prefix=contact_')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.length > 0) {
          // Map existing settings to contact info
          const existingContacts = result.data.map((setting: any) => {
            const defaultContact = defaultContacts.find(c => c.key === setting.key)
            return defaultContact ? {
              ...defaultContact,
              value: setting.value || defaultContact.value
            } : null
          }).filter(Boolean)
          
          setContactInfoList(existingContacts.length > 0 ? existingContacts : defaultContacts)
        } else {
          setContactInfoList(defaultContacts)
        }
      } else {
        setContactInfoList(defaultContacts)
      }
    } catch (error) {
      console.error('Error loading contact info:', error)
      setContactInfoList(defaultContacts)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContactInfo()
  }, [loadContactInfo])

  const handleEditContact = useCallback((contactId: string) => {
    const contact = contactInfoList.find(c => c.id === contactId)
    if (contact) {
      setEditedContact(contact)
      setEditingContact(contactId)
      setIsCreatingNew(false)
    }
  }, [contactInfoList])

  const handleCreateNew = useCallback(() => {
    setEditedContact({
      id: `new_${Date.now()}`,
      key: '',
      label: '',
      value: '',
      type: 'email',
      department: selectedDepartment as any,
      displayLocation: ['footer'],
      isPublic: true,
      order: contactInfoList.filter(c => c.department === selectedDepartment).length + 1
    })
    setEditingContact('new')
    setIsCreatingNew(true)
  }, [selectedDepartment, contactInfoList])

  const handleCancelEdit = useCallback(() => {
    setEditingContact(null)
    setEditedContact({})
    setIsCreatingNew(false)
  }, [])

  const handleSaveContact = useCallback(async (contactId: string) => {
    const contact = editedContact
    
    if (!contact || !contact.key || !contact.label || !contact.value) {
      setLastSaveResult('請填寫所有必填欄位')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: contact.key,
          value: contact.value,
          description: contact.description || `Contact info: ${contact.label}`,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          if (isCreatingNew) {
            // Add new contact
            const newContact = {
              ...contact,
              key: contact.key.startsWith('contact_') ? contact.key : `contact_${contact.key}`
            } as ContactInfo
            setContactInfoList(prev => [...prev, newContact])
          } else {
            // Update existing contact
            setContactInfoList(prev => prev.map(c => 
              c.id === contactId ? { ...c, ...contact } : c
            ))
          }
          setEditingContact(null)
          setEditedContact({})
          setIsCreatingNew(false)
          setLastSaveResult('聯絡資訊更新成功！')
        } else {
          setLastSaveResult('更新失敗：' + (result.error || '未知錯誤'))
        }
      } else {
        setLastSaveResult('更新失敗：伺服器錯誤')
      }
    } catch (error) {
      console.error('Error saving contact:', error)
      setLastSaveResult('更新失敗：' + (error instanceof Error ? error.message : '網路錯誤'))
    } finally {
      setIsSaving(false)
    }
  }, [editedContact, isCreatingNew])

  const handleDeleteContact = useCallback(async (contactId: string) => {
    const contact = contactInfoList.find(c => c.id === contactId)
    if (!contact) return

    if (!confirm(`確定要刪除聯絡資訊「${contact.label}」嗎？`)) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/settings?key=${contact.key}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setContactInfoList(prev => prev.filter(c => c.id !== contactId))
        setLastSaveResult('聯絡資訊刪除成功！')
      } else {
        setLastSaveResult('刪除失敗：伺服器錯誤')
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      setLastSaveResult('刪除失敗：' + (error instanceof Error ? error.message : '網路錯誤'))
    } finally {
      setIsSaving(false)
    }
  }, [contactInfoList])

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail
      case 'phone': return Phone
      case 'address': return MapPin
      case 'website': return Globe
      case 'hours': return Clock
      default: return Users
    }
  }

  const getDepartmentIcon = (dept: string) => {
    switch (dept) {
      case 'teachers': return Users
      case 'parents': return Users
      case 'admin': return Building
      case 'emergency': return AlertCircle
      default: return Building
    }
  }

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
      case 'teachers': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'parents': return 'bg-green-100 text-green-800 border-green-200'
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredContacts = contactInfoList.filter(contact => 
    selectedDepartment === 'all' || contact.department === selectedDepartment
  )

  return (
    <Card className={`bg-white/90 backdrop-blur-lg shadow-lg border-0 ${className}`}>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
          <span className="hidden sm:inline">聯絡資訊管理</span>
          <span className="sm:hidden">聯絡管理</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {/* 載入狀態 */}
        {isLoading && (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">載入中...</span>
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

        {!isLoading && (
          <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment} className="w-full">
            {/* 行動版使用滿版滿訊式 */}
            <div className="w-full overflow-x-auto">
              <TabsList className="grid w-full grid-cols-5 min-w-[320px] sm:min-w-0">
                <TabsTrigger value="all" className="min-h-[44px] text-xs sm:text-sm">全部</TabsTrigger>
                <TabsTrigger value="general" className="min-h-[44px] text-xs sm:text-sm">一般</TabsTrigger>
                <TabsTrigger value="teachers" className="min-h-[44px] text-xs sm:text-sm">教師</TabsTrigger>
                <TabsTrigger value="parents" className="min-h-[44px] text-xs sm:text-sm">家長</TabsTrigger>
                <TabsTrigger value="admin" className="min-h-[44px] text-xs sm:text-sm">管理</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={selectedDepartment} className="space-y-4 mt-4 sm:mt-6">
              {/* 新增按鈕 */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  <span className="hidden sm:inline">{selectedDepartment === 'all' ? '所有聯絡資訊' : `${selectedDepartment} 部門聯絡資訊`}</span>
                  <span className="sm:hidden">{selectedDepartment === 'all' ? '所有資訊' : `${selectedDepartment} 部門`}</span>
                </h3>
                <Button
                  onClick={handleCreateNew}
                  disabled={isSaving || editingContact !== null}
                  className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto min-h-[44px]"
                >
                  <Plus className="w-4 h-4 mr-2 shrink-0" />
                  <span className="hidden sm:inline">新增聯絡資訊</span>
                  <span className="sm:hidden">新增</span>
                </Button>
              </div>

              {/* 新增/編輯表單 */}
              {editingContact && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6"
                >
                  <h4 className="text-base sm:text-lg font-medium text-blue-900 mb-4">
                    {isCreatingNew ? '新增聯絡資訊' : '編輯聯絡資訊'}
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="label" className="text-sm font-medium">名稱 *</Label>
                      <Input
                        id="label"
                        value={editedContact.label || ''}
                        onChange={(e) => setEditedContact(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="例：學校主要信箱"
                        className="min-h-[44px] text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="key" className="text-sm font-medium">系統鍵值 *</Label>
                      <Input
                        id="key"
                        value={editedContact.key || ''}
                        onChange={(e) => setEditedContact(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="例：general_main_email"
                        className="min-h-[44px] text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="type" className="text-sm font-medium">類型 *</Label>
                      <Select 
                        value={editedContact.type} 
                        onValueChange={(value) => setEditedContact(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
                          <SelectValue placeholder="選擇類型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">電子信箱</SelectItem>
                          <SelectItem value="phone">電話</SelectItem>
                          <SelectItem value="address">地址</SelectItem>
                          <SelectItem value="website">網站</SelectItem>
                          <SelectItem value="hours">開放時間</SelectItem>
                          <SelectItem value="text">文字</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="department" className="text-sm font-medium">部門 *</Label>
                      <Select 
                        value={editedContact.department} 
                        onValueChange={(value) => setEditedContact(prev => ({ ...prev, department: value as any }))}
                      >
                        <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
                          <SelectValue placeholder="選擇部門" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">一般</SelectItem>
                          <SelectItem value="teachers">教師</SelectItem>
                          <SelectItem value="parents">家長</SelectItem>
                          <SelectItem value="admin">管理</SelectItem>
                          <SelectItem value="emergency">緊急</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="value" className="text-sm font-medium">聯絡資訊內容 *</Label>
                      <Input
                        id="value"
                        value={editedContact.value || ''}
                        onChange={(e) => setEditedContact(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="例：info@kcislk.ntpc.edu.tw"
                        className="min-h-[44px] text-sm sm:text-base"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="description" className="text-sm font-medium">描述</Label>
                      <Textarea
                        id="description"
                        value={editedContact.description || ''}
                        onChange={(e) => setEditedContact(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="簡要描述此聯絡資訊的用途"
                        rows={2}
                        className="min-h-[44px] text-sm sm:text-base resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                      onClick={() => handleSaveContact(editingContact)}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto min-h-[44px]"
                    >
                      <Save className="w-4 h-4 mr-2 shrink-0" />
                      {isSaving ? '保存中...' : '保存'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      取消
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* 聯絡資訊列表 */}
              <div className="space-y-3">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Phone className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">此部門暫無聯絡資訊</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-x-auto">
                    {filteredContacts.map((contact) => {
                      const ContactIcon = getContactIcon(contact.type)
                      const DeptIcon = getDepartmentIcon(contact.department)
                      
                      return (
                        <motion.div
                          key={contact.id}
                          layout
                          className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white min-w-0"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <ContactIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 shrink-0" />
                                <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{contact.label}</h4>
                                <Badge className={`${getDepartmentColor(contact.department)} text-xs shrink-0`}>
                                  <DeptIcon className="w-3 h-3 mr-1" />
                                  {contact.department}
                                </Badge>
                                {contact.isPublic && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                    公開
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-xs sm:text-sm text-gray-600 mb-2 break-all">
                                <strong>內容：</strong> {contact.value}
                              </div>
                              
                              {contact.description && (
                                <div className="text-xs text-gray-500 mb-2">
                                  {contact.description}
                                </div>
                              )}
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                                <span>類型：{contact.type}</span>
                                <span className="hidden sm:block">顯示位置：{contact.displayLocation.join(', ')}</span>
                                <span>順序：{contact.order}</span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <Button
                                variant="outline"
                                onClick={() => handleEditContact(contact.id)}
                                disabled={editingContact !== null || isSaving}
                                className="gap-1 min-h-[44px] text-sm w-full sm:w-auto"
                              >
                                <Edit className="w-3 h-3" />
                                編輯
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleDeleteContact(contact.id)}
                                disabled={editingContact !== null || isSaving}
                                className="gap-1 border-red-300 text-red-600 hover:bg-red-50 min-h-[44px] text-sm w-full sm:w-auto"
                              >
                                <Trash2 className="w-3 h-3" />
                                刪除
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* 使用說明 */}
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
          <h5 className="text-sm font-medium text-blue-900 mb-2">使用說明</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 各部門聯絡資訊可在對應頁面顯示</li>
            <li>• 公開聯絡資訊會顯示在前台頁面</li>
            <li className="hidden sm:block">• 系統鍵值用於程式識別，不可重複</li>
            <li>• 順序數值決定顯示順序</li>
            <li className="hidden sm:block">• 緊急聯絡資訊會在所有頁面顯示</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}