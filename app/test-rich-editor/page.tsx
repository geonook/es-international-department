'use client'

/**
 * Rich Text Editor Test Page
 * Rich text editor testing interface
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Eye, 
  Code, 
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'
import { sanitizeHtml, extractTextFromHtml, getHtmlStats } from '@/lib/html-sanitizer'

export default function TestRichEditorPage() {
  const [content, setContent] = useState(`
    <h2>Welcome to the Rich Text Editor</h2>
    <p>This is a fully-featured rich text editor that supports the following functions:</p>
    <ul>
      <li><strong>Text Formatting</strong>: Bold, italic, underline, etc.</li>
      <li><strong>Headers</strong>: Multiple header level support</li>
      <li><strong>Lists</strong>: Ordered and unordered lists</li>
      <li><strong>Links</strong>: <a href="https://example.com" target="_blank">External links</a></li>
      <li><strong>Blockquotes</strong></li>
    </ul>
    
    <blockquote>
      <p>This is an example of a blockquote, which can be used to highlight important information.</p>
    </blockquote>
    
    <p>The editor supports advanced features such as auto-save, word count, content validation, and more.</p>
  `)
  
  const [autoSave, setAutoSave] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  const handleAutoSave = (content: string) => {
    setSaveStatus('saving')
    // Simulate API call
    setTimeout(() => {
      console.log('Auto-saved content:', content.substring(0, 100) + '...')
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const handleManualSave = () => {
    setSaveStatus('saving')
    setTimeout(() => {
      console.log('Manually saved content:', content.substring(0, 100) + '...')
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 500)
  }

  const handleReset = () => {
    setContent('')
  }

  const handleLoadSample = () => {
    setContent(`
      <h1>Sample Announcement: International Culture Day Event Notice</h1>
      
      <p><strong>Dear Parents and Students:</strong></p>
      
      <p>We are pleased to announce that the ES International Department will be holding our annual International Culture Day event on <em>February 28th</em>!</p>
      
      <h2>Event Details</h2>
      <ul>
        <li><strong>Date:</strong> Friday, February 28th, 2025</li>
        <li><strong>Time:</strong> 9:00 AM - 3:00 PM</li>
        <li><strong>Venue:</strong> School multipurpose hall and various classrooms</li>
        <li><strong>Participants:</strong> All students, staff, and parents</li>
      </ul>
      
      <h2>Event Activities</h2>
      <ol>
        <li><strong>Cultural Exhibition:</strong> Introduction to various cultures and traditional costume displays</li>
        <li><strong>Food Tasting:</strong> Special delicacies from around the world</li>
        <li><strong>Performance Shows:</strong> Student talent shows and folk dances</li>
        <li><strong>Interactive Games:</strong> Cultural knowledge quiz and handicraft experiences</li>
      </ol>
      
      <blockquote>
        <p><strong>Special Reminder:</strong> Parents are welcome to wear traditional costumes to participate in the event. Let's celebrate cultural diversity together!</p>
      </blockquote>
      
      <h2>Registration Methods</h2>
      <p>Please register by <strong>February 20th</strong> through one of the following methods:</p>
      <ul>
        <li>Online Registration: <a href="https://school.example.com/register" target="_blank">Click here to register</a></li>
        <li>Paper Registration: Complete the registration form and submit to your homeroom teacher</li>
        <li>Phone Registration: (02) 1234-5678</li>
      </ul>
      
      <p>We look forward to your participation!</p>
      
      <p><em>ES International Department Academic Affairs Office<br>February 1st, 2025</em></p>
    `)
  }

  const stats = getHtmlStats(content)
  const textContent = extractTextFromHtml(content)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Rich Text Editor Test
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This is the rich text editor testing page for the KCISLK ESID Info Hub announcement system. You can test various editor features here, including formatting, auto-save, content validation, and more.
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.wordCount}</div>
              <div className="text-sm text-gray-600">Words</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.charCount}</div>
              <div className="text-sm text-gray-600">Characters</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.htmlLength}</div>
              <div className="text-sm text-gray-600">HTML Length</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                {saveStatus === 'idle' && <Badge variant="outline">Idle</Badge>}
                {saveStatus === 'saving' && <Badge variant="outline" className="text-blue-600">Saving...</Badge>}
                {saveStatus === 'saved' && <Badge variant="outline" className="text-green-600">Saved</Badge>}
                {saveStatus === 'error' && <Badge variant="destructive">Save Failed</Badge>}
              </div>
              <div className="text-sm text-gray-600">Save Status</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Rich Text Editor
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                        className="rounded"
                      />
                      Auto Save
                    </label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RichTextEditor
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start typing your content..."
                  minHeight={400}
                  maxHeight={600}
                  showWordCount={true}
                  showCharCount={true}
                  autoSave={autoSave}
                  autoSaveInterval={3000}
                  onAutoSave={handleAutoSave}
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleManualSave} size="sm" disabled={saveStatus === 'saving'}>
                    <Save className="w-4 h-4 mr-2" />
                    Manual Save
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Content
                  </Button>
                  <Button onClick={handleLoadSample} variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Load Sample
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview and Code */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  Preview & Source Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="text">Plain Text</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview" className="mt-4">
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert bg-white p-4 rounded border min-h-[300px] max-h-[400px] overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="html" className="mt-4">
                    <pre className="bg-gray-50 p-4 rounded border text-xs overflow-x-auto min-h-[300px] max-h-[400px] overflow-y-auto">
                      <code>{content}</code>
                    </pre>
                  </TabsContent>
                  
                  <TabsContent value="text" className="mt-4">
                    <div className="bg-gray-50 p-4 rounded border text-sm min-h-[300px] max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                      {textContent || 'No content'}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                Usage Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Editor Features</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Text formatting (bold, italic, underline)</li>
                    <li>• Multi-level headers (H1-H6)</li>
                    <li>• Ordered and unordered lists</li>
                    <li>• Link insertion and editing</li>
                    <li>• Blockquotes and code blocks</li>
                    <li>• Table insertion and editing</li>
                    <li>• Text alignment and indentation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Advanced Features</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Auto-save (configurable interval)</li>
                    <li>• Real-time word and character count</li>
                    <li>• HTML content sanitization and validation</li>
                    <li>• Responsive design and dark theme</li>
                    <li>• Content length limits and warnings</li>
                    <li>• Keyboard shortcut support</li>
                    <li>• Accessibility features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}