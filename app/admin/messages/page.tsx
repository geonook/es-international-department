'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import MessageBoardForm from '@/components/admin/MessageBoardForm'
import MessageBoardList from '@/components/admin/MessageBoardList'
import { motion, AnimatePresence } from 'framer-motion'

interface MessageBoardData {
  id: number
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
  viewCount: number
  replyCount: number
  author?: {
    displayName: string
    firstName?: string
    lastName?: string
  }
  createdAt: string
  updatedAt: string
}

export default function MessageBoardAdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [showForm, setShowForm] = useState(false)
  const [editingMessage, setEditingMessage] = useState<MessageBoardData | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')

  // Check authentication and permissions
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user && (!user.roles?.includes('admin') && !user.roles?.includes('office_member'))) {
      router.push('/admin')
      return
    }
  }, [isAuthenticated, authLoading, user, router])

  const handleCreateNew = () => {
    setEditingMessage(null)
    setShowForm(true)
    setError('')
  }

  const handleEdit = (message: MessageBoardData) => {
    setEditingMessage(message)
    setShowForm(true)
    setError('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這則訊息嗎？此操作無法復原。')) {
      return
    }

    try {
      setFormLoading(true)
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // MessageBoardList 組件會自動重新載入列表
        window.location.reload()
      } else {
        setError(result.message || 'Failed to delete message')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('Failed to delete message')
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      setFormLoading(true)
      setError('')

      const messageData = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary || null,
        targetAudience: formData.targetAudience || 'all',
        sourceGroup: formData.sourceGroup || null,
        priority: formData.priority || 'medium',
        isImportant: formData.isImportant || false,
        isPinned: formData.isPinned || false,
        status: formData.status || 'published',
        expiresAt: formData.expiresAt || null
      }

      const url = editingMessage 
        ? `/api/admin/messages/${editingMessage.id}` 
        : '/api/admin/messages'

      const method = editingMessage ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(messageData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setShowForm(false)
        setEditingMessage(null)
        // Refresh the page to reload the list
        window.location.reload()
      } else {
        setError(result.message || 'Failed to save message')
      }
    } catch (error) {
      console.error('Failed to save message:', error)
      setError('Failed to save message')
    } finally {
      setFormLoading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingMessage(null)
    setError('')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <MessageBoardList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={formLoading}
        />

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <MessageBoardForm
                  message={editingMessage}
                  mode={editingMessage ? 'edit' : 'create'}
                  onCancel={handleCancel}
                  onSubmit={handleFormSubmit}
                  loading={formLoading}
                  error={error}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}