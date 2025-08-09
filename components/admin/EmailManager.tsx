/**
 * Email Management Component
 * Email Management Component
 * 
 * @description Administrator email management interface
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

  // Send email state
  const [sendForm, setSendForm] = useState({
    type: 'single',
    template: '',
    recipients: '',
    subject: '',
    content: '',
    priority: 'normal'
  })
  const [sending, setSending] = useState(false)

  // Test state
  const [testResults, setTestResults] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchEmailStats()
  }, [])

  /**
   * Fetch email service statistics
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
      console.error('Failed to fetch email statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Send email
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
        alert('Email sent successfully!')
        setSendForm({
          type: 'single',
          template: '',
          recipients: '',
          subject: '',
          content: '',
          priority: 'normal'
        })
        fetchEmailStats() // Refresh statistics
      } else {
        alert(`Failed to send email: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      alert('Failed to send email')
    } finally {
      setSending(false)
    }
  }

  /**
   * Run test
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
      console.error('Test failed:', error)
      setTestResults({
        success: false,
        error: 'Test execution failed'
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
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">
            Manage email services, send emails and view statistics
          </p>
        </div>
        <Button 
          onClick={fetchEmailStats} 
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Service Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Status</CardTitle>
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
                {stats?.connection ? 'Connected' : 'Connection Failed'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.queue.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total ({stats?.queue.pending || 0} pending)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Send Statistics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.queue.sent || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sent ({stats?.queue.failed || 0} failed)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Per Minute</span>
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="send">Send Email</TabsTrigger>
          <TabsTrigger value="templates">Template Management</TabsTrigger>
          <TabsTrigger value="test">System Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Queue Details</CardTitle>
                <CardDescription>
                  Current email queue status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <Badge variant="secondary">{stats?.queue.pending || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing</span>
                    <Badge variant="default">{stats?.queue.processing || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Sent</span>
                    <Badge variant="success">{stats?.queue.sent || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed</span>
                    <Badge variant="destructive">{stats?.queue.failed || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  Current email service configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Provider</span>
                    <span className="font-mono text-sm">
                      {process.env.EMAIL_PROVIDER || 'smtp'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Queue Enabled</span>
                    <Badge variant={process.env.EMAIL_QUEUE_ENABLED === 'true' ? 'success' : 'secondary'}>
                      {process.env.EMAIL_QUEUE_ENABLED === 'true' ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Test Mode</span>
                    <Badge variant={process.env.EMAIL_TEST_MODE === 'true' ? 'warning' : 'secondary'}>
                      {process.env.EMAIL_TEST_MODE === 'true' ? 'Enabled' : 'Disabled'}
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
              <CardTitle>Send Email</CardTitle>
              <CardDescription>
                Send single or bulk emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="send-type">Send Type</Label>
                  <Select
                    value={sendForm.type}
                    onValueChange={(value) => setSendForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Send Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Email</SelectItem>
                      <SelectItem value="bulk">Bulk Email</SelectItem>
                      <SelectItem value="announcement">Announcement Email</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select
                    value={sendForm.template}
                    onValueChange={(value) => setSendForm(prev => ({ ...prev, template: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Template" />
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
                <Label htmlFor="recipients">Recipients</Label>
                <Input
                  id="recipients"
                  placeholder="Enter email addresses, separate multiple addresses with commas"
                  value={sendForm.recipients}
                  onChange={(e) => setSendForm(prev => ({ ...prev, recipients: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={sendForm.subject}
                  onChange={(e) => setSendForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Email content"
                  rows={8}
                  value={sendForm.content}
                  onChange={(e) => setSendForm(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={sendForm.priority}
                    onValueChange={(value) => setSendForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
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
                  Clear
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={sending || !sendForm.recipients || !sendForm.subject}
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
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
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                View and manage available email templates
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
                            <span className="text-sm font-medium">Subject Template: </span>
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {template.subject}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Available Variables: </span>
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
                <CardTitle>System Testing</CardTitle>
                <CardDescription>
                  Test various email service functions
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
                    Connection Test
                  </Button>
                  <Button
                    onClick={() => runEmailTest('template')}
                    disabled={testing}
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Template Test
                  </Button>
                  <Button
                    onClick={() => runEmailTest('send')}
                    disabled={testing}
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </Button>
                  <Button
                    onClick={() => runEmailTest('queue')}
                    disabled={testing}
                    variant="outline"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Queue Test
                  </Button>
                </div>

                {testing && (
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Testing in progress...</span>
                  </div>
                )}

                {testResults && (
                  <div className="mt-4">
                    <Alert variant={testResults.success ? "default" : "destructive"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="font-medium">
                            {testResults.message || (testResults.success ? 'Test Successful' : 'Test Failed')}
                          </div>
                          {testResults.error && (
                            <div className="text-sm text-muted-foreground">
                              Error: {testResults.error}
                            </div>
                          )}
                          {testResults.results && (
                            <details className="text-sm">
                              <summary className="cursor-pointer font-medium">Detailed Results</summary>
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