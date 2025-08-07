/**
 * Email Management Component
 * 電子郵件管理組件
 * 
 * @description 管理員電子郵件管理界面
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Send, 
  Users, 
  Settings, 
  BarChart3, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Trash2,
  Eye,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'

interface EmailStats {
  connection: boolean
  queue: {
    total: number
    pending: number
    processing: number
    sent: number
    failed: number
  }
  rateLimits: {
    perMinute: number
    perHour: number
  }
  sentCounts: {
    minute: number
    hour: number
  }
}

interface EmailTemplate {
  name: string
  subject: string
  description: string
  variables: string[]
  requiredVariables: string[]
  category: string
}

export default function EmailManager() {
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // 發送郵件狀態
  const [sendForm, setSendForm] = useState({
    type: 'single',
    template: '',
    recipients: '',
    subject: '',
    content: '',
    priority: 'normal'
  })
  const [sending, setSending] = useState(false)

  // 測試狀態
  const [testResults, setTestResults] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchEmailStats()
  }, [])

  /**
   * 獲取郵件服務統計
   */
  const fetchEmailStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/email/send', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.queue ? {
          connection: data.connection,
          queue: data.queue,
          rateLimits: data.queue.rateLimits || { perMinute: 60, perHour: 1000 },
          sentCounts: data.queue.sentCounts || { minute: 0, hour: 0 }
        } : null)
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('獲取郵件統計失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 發送郵件
   */
  const handleSendEmail = async () => {
    setSending(true)
    try {
      const token = localStorage.getItem('token')
      const recipients = sendForm.recipients.split(',').map(email => email.trim()).filter(Boolean)
      
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: sendForm.type,
          recipients,
          template: sendForm.template,
          templateData: {
            title: sendForm.subject,
            content: sendForm.content,
            priority: sendForm.priority
          },
          options: {
            priority: sendForm.priority
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('郵件發送成功！')
        setSendForm({
          type: 'single',
          template: '',
          recipients: '',
          subject: '',
          content: '',
          priority: 'normal'
        })
        fetchEmailStats() // 刷新統計
      } else {
        alert(`郵件發送失敗: ${result.error}`)
      }
    } catch (error) {
      console.error('發送郵件失敗:', error)
      alert('郵件發送失敗')
    } finally {
      setSending(false)
    }
  }

  /**
   * 運行測試
   */
  const runEmailTest = async (testType: string) => {
    setTesting(true)
    setTestResults(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          testType,
          templateType: 'welcome',
          recipient: 'test@example.com'
        })
      })

      const result = await response.json()
      setTestResults(result)
    } catch (error) {
      console.error('測試失敗:', error)
      setTestResults({
        success: false,
        error: '測試執行失敗'
      })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">電子郵件管理</h1>
          <p className="text-muted-foreground">
            管理電子郵件服務、發送郵件和查看統計
          </p>
        </div>
        <Button 
          onClick={fetchEmailStats} 
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 服務狀態概覽 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">服務狀態</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {stats?.connection ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {stats?.connection ? '連接正常' : '連接失敗'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">佇列狀態</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.queue.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              總計 ({stats?.queue.pending || 0} 待處理)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">發送統計</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.queue.sent || 0}</div>
            <p className="text-xs text-muted-foreground">
              已發送 ({stats?.queue.failed || 0} 失敗)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">速率限制</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>每分鐘</span>
                <span>{stats?.sentCounts.minute || 0}/{stats?.rateLimits.perMinute || 60}</span>
              </div>
              <Progress 
                value={(stats?.sentCounts.minute || 0) / (stats?.rateLimits.perMinute || 60) * 100} 
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">概覽</TabsTrigger>
          <TabsTrigger value="send">發送郵件</TabsTrigger>
          <TabsTrigger value="templates">模板管理</TabsTrigger>
          <TabsTrigger value="test">系統測試</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>佇列詳情</CardTitle>
                <CardDescription>
                  當前郵件佇列狀態
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>待處理</span>
                    <Badge variant="secondary">{stats?.queue.pending || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>處理中</span>
                    <Badge variant="default">{stats?.queue.processing || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>已發送</span>
                    <Badge variant="success">{stats?.queue.sent || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>失敗</span>
                    <Badge variant="destructive">{stats?.queue.failed || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>系統配置</CardTitle>
                <CardDescription>
                  當前郵件服務配置
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>提供商</span>
                    <span className="font-mono text-sm">
                      {process.env.EMAIL_PROVIDER || 'smtp'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>佇列啟用</span>
                    <Badge variant={process.env.EMAIL_QUEUE_ENABLED === 'true' ? 'success' : 'secondary'}>
                      {process.env.EMAIL_QUEUE_ENABLED === 'true' ? '啟用' : '停用'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>測試模式</span>
                    <Badge variant={process.env.EMAIL_TEST_MODE === 'true' ? 'warning' : 'secondary'}>
                      {process.env.EMAIL_TEST_MODE === 'true' ? '啟用' : '停用'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>發送郵件</CardTitle>
              <CardDescription>
                發送單一或批量郵件
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="send-type">發送類型</Label>
                  <Select
                    value={sendForm.type}
                    onValueChange={(value) => setSendForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇發送類型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">單一郵件</SelectItem>
                      <SelectItem value="bulk">批量郵件</SelectItem>
                      <SelectItem value="announcement">公告郵件</SelectItem>
                      <SelectItem value="newsletter">電子報</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">郵件模板</Label>
                  <Select
                    value={sendForm.template}
                    onValueChange={(value) => setSendForm(prev => ({ ...prev, template: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">收件人</Label>
                <Input
                  id="recipients"
                  placeholder="輸入郵件地址，多個地址用逗號分隔"
                  value={sendForm.recipients}
                  onChange={(e) => setSendForm(prev => ({ ...prev, recipients: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">主題</Label>
                <Input
                  id="subject"
                  placeholder="郵件主題"
                  value={sendForm.subject}
                  onChange={(e) => setSendForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">內容</Label>
                <Textarea
                  id="content"
                  placeholder="郵件內容"
                  rows={8}
                  value={sendForm.content}
                  onChange={(e) => setSendForm(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">優先級</Label>
                  <Select
                    value={sendForm.priority}
                    onValueChange={(value) => setSendForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低優先級</SelectItem>
                      <SelectItem value="normal">普通</SelectItem>
                      <SelectItem value="high">高優先級</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSendForm({
                    type: 'single',
                    template: '',
                    recipients: '',
                    subject: '',
                    content: '',
                    priority: 'normal'
                  })}
                >
                  清空
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={sending || !sendForm.recipients || !sendForm.subject}
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      發送中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      發送郵件
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>郵件模板</CardTitle>
              <CardDescription>
                查看和管理可用的郵件模板
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template, index) => (
                  <motion.div
                    key={template.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{template.description}</CardTitle>
                            <CardDescription>{template.name}</CardDescription>
                          </div>
                          <Badge>{template.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">主題模板: </span>
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {template.subject}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">可用變量: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.variables.map((variable) => (
                                <Badge
                                  key={variable}
                                  variant={template.requiredVariables.includes(variable) ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {variable}
                                  {template.requiredVariables.includes(variable) && '*'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>系統測試</CardTitle>
                <CardDescription>
                  測試郵件服務的各項功能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button
                    onClick={() => runEmailTest('connection')}
                    disabled={testing}
                    variant="outline"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    連接測試
                  </Button>
                  <Button
                    onClick={() => runEmailTest('template')}
                    disabled={testing}
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    模板測試
                  </Button>
                  <Button
                    onClick={() => runEmailTest('send')}
                    disabled={testing}
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    發送測試
                  </Button>
                  <Button
                    onClick={() => runEmailTest('queue')}
                    disabled={testing}
                    variant="outline"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    佇列測試
                  </Button>
                </div>

                {testing && (
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">測試進行中...</span>
                  </div>
                )}

                {testResults && (
                  <div className="mt-4">
                    <Alert variant={testResults.success ? "default" : "destructive"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="font-medium">
                            {testResults.message || (testResults.success ? '測試成功' : '測試失敗')}
                          </div>
                          {testResults.error && (
                            <div className="text-sm text-muted-foreground">
                              錯誤: {testResults.error}
                            </div>
                          )}
                          {testResults.results && (
                            <details className="text-sm">
                              <summary className="cursor-pointer font-medium">詳細結果</summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                {JSON.stringify(testResults.results, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}