'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, 
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Pin,
  AlertTriangle,
  Eye,
  Calendar,
  User,
  MoreVertical
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

interface MessageBoardItem {
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
  publishedAt?: string
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

interface MessageBoardListProps {
  onCreateNew: () => void
  onEdit: (message: MessageBoardItem) => void
  onDelete: (id: number) => void
  loading?: boolean
}

export default function MessageBoardList({
  onCreateNew,
  onEdit,
  onDelete,
  loading = false
}: MessageBoardListProps) {
  const [messages, setMessages] = useState<MessageBoardItem[]>([])
  const [filteredMessages, setFilteredMessages] = useState<MessageBoardItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterAudience, setFilterAudience] = useState('all')

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages?limit=50')
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  // Filter messages
  useEffect(() => {
    let filtered = messages

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(message => message.status === filterStatus)
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(message => message.priority === filterPriority)
    }

    // Audience filter
    if (filterAudience !== 'all') {
      filtered = filtered.filter(message => message.targetAudience === filterAudience)
    }

    setFilteredMessages(filtered)
  }, [messages, searchTerm, filterStatus, filterPriority, filterAudience])

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-purple-100 text-purple-800'
  }

  const audienceColors = {
    all: 'bg-blue-100 text-blue-800',
    teachers: 'bg-purple-100 text-purple-800',
    parents: 'bg-pink-100 text-pink-800'
  }

  const handleEdit = (message: MessageBoardItem) => {
    onEdit(message)
  }

  const handleDelete = async (id: number) => {
    if (confirm('確定要刪除這則訊息嗎？此操作無法復原。')) {
      try {
        const response = await fetch(`/api/admin/messages/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          // Refresh the list
          fetchMessages()
        } else {
          alert('刪除失敗，請重試。')
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert('刪除失敗，請重試。')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Message Board Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage messages displayed on the homepage
          </p>
        </div>

        <Button 
          onClick={onCreateNew}
          className="bg-gradient-to-r from-indigo-600 to-purple-800 hover:from-indigo-700 hover:to-purple-900"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Message
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAudience} onValueChange={setFilterAudience}>
              <SelectTrigger>
                <SelectValue placeholder="All Audiences" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="teachers">Teachers</SelectItem>
                <SelectItem value="parents">Parents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {message.isPinned && (
                          <Pin className="h-4 w-4 text-blue-600" />
                        )}
                        {message.isImportant && (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {message.title}
                        </h3>
                      </div>

                      {message.summary && (
                        <p className="text-sm text-blue-600 italic mb-2">
                          {message.summary}
                        </p>
                      )}

                      <p className="text-gray-600 line-clamp-2 mb-3">
                        {message.content}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge className={audienceColors[message.targetAudience]}>
                          {message.targetAudience === 'all' ? 'All Users' : 
                           message.targetAudience === 'teachers' ? 'Teachers' : 'Parents'}
                        </Badge>
                        
                        <Badge className={priorityColors[message.priority]}>
                          {message.priority} Priority
                        </Badge>
                        
                        <Badge className={statusColors[message.status]}>
                          {message.status}
                        </Badge>

                        {message.sourceGroup && (
                          <Badge variant="outline">
                            {message.sourceGroup}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {message.author?.displayName || 
                           `${message.author?.firstName || ''} ${message.author?.lastName || ''}`.trim() || 
                           'Unknown'}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(message.createdAt), 'MM/dd HH:mm', { locale: zhTW })}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {message.viewCount} views
                        </div>

                        {message.expiresAt && (
                          <div className="text-red-500">
                            Expires: {format(new Date(message.expiresAt), 'MM/dd HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(message)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(message.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMessages.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No messages found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAudience !== 'all'
                  ? 'Try adjusting your filters or search term.'
                  : 'Get started by creating your first message.'}
              </p>
              {(!searchTerm && filterStatus === 'all' && filterPriority === 'all' && filterAudience === 'all') && (
                <Button onClick={onCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Message
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}