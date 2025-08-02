'use client'

/**
 * Rich Text Editor Test Page
 * 富文本編輯器測試頁面
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
    <h2>歡迎使用富文本編輯器</h2>
    <p>這是一個功能完整的富文本編輯器，支援以下功能：</p>
    <ul>
      <li><strong>文字格式化</strong>：粗體、斜體、底線等</li>
      <li><strong>標題</strong>：多級標題支援</li>
      <li><strong>列表</strong>：有序和無序列表</li>
      <li><strong>連結</strong>：<a href="https://example.com" target="_blank">外部連結</a></li>
      <li><strong>引用區塊</strong></li>
    </ul>
    
    <blockquote>
      <p>這是一個引用區塊的範例，可以用來突出重要資訊。</p>
    </blockquote>
    
    <p>編輯器支援自動儲存、字數統計、內容驗證等進階功能。</p>
  `)
  
  const [autoSave, setAutoSave] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  const handleAutoSave = (content: string) => {
    setSaveStatus('saving')
    // 模擬 API 調用
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
      <h1>範例公告：國際文化日活動通知</h1>
      
      <p><strong>親愛的家長及同學們：</strong></p>
      
      <p>我們很高興地宣布，ES國際部將於 <em>2月28日</em> 舉辦一年一度的國際文化日活動！</p>
      
      <h2>活動詳情</h2>
      <ul>
        <li><strong>日期：</strong>2025年2月28日（星期五）</li>
        <li><strong>時間：</strong>上午9:00 - 下午3:00</li>
        <li><strong>地點：</strong>學校多功能廳及各教室</li>
        <li><strong>參與對象：</strong>全校師生及家長</li>
      </ul>
      
      <h2>活動內容</h2>
      <ol>
        <li><strong>文化展示區：</strong>各國文化介紹、傳統服飾展示</li>
        <li><strong>美食品嘗：</strong>來自世界各地的特色小食</li>
        <li><strong>表演節目：</strong>學生才藝表演、民族舞蹈</li>
        <li><strong>互動遊戲：</strong>文化知識問答、手工藝體驗</li>
      </ol>
      
      <blockquote>
        <p><strong>特別提醒：</strong>歡迎家長穿著傳統服飾參與活動，讓我們一起慶祝文化的多樣性！</p>
      </blockquote>
      
      <h2>報名方式</h2>
      <p>請於 <strong>2月20日前</strong> 透過以下方式報名：</p>
      <ul>
        <li>線上報名：<a href="https://school.example.com/register" target="_blank">點此報名</a></li>
        <li>紙本報名：填寫報名表交至班導師</li>
        <li>電話報名：(02) 1234-5678</li>
      </ul>
      
      <p>期待您的參與！</p>
      
      <p><em>ES國際部教務處<br>2025年2月1日</em></p>
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
            富文本編輯器測試
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            這是 ES 國際部公告系統的富文本編輯器測試頁面。您可以在這裡測試編輯器的各種功能，包括格式化、自動儲存、內容驗證等。
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
              <div className="text-sm text-gray-600">字數</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.charCount}</div>
              <div className="text-sm text-gray-600">字元數</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.htmlLength}</div>
              <div className="text-sm text-gray-600">HTML 長度</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                {saveStatus === 'idle' && <Badge variant="outline">待機中</Badge>}
                {saveStatus === 'saving' && <Badge variant="outline" className="text-blue-600">儲存中...</Badge>}
                {saveStatus === 'saved' && <Badge variant="outline" className="text-green-600">已儲存</Badge>}
                {saveStatus === 'error' && <Badge variant="destructive">儲存失敗</Badge>}
              </div>
              <div className="text-sm text-gray-600">儲存狀態</div>
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
                    富文本編輯器
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                        className="rounded"
                      />
                      自動儲存
                    </label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RichTextEditor
                  value={content}
                  onChange={handleContentChange}
                  placeholder="開始輸入您的內容..."
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
                    手動儲存
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    清空內容
                  </Button>
                  <Button onClick={handleLoadSample} variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    載入範例
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
                  預覽與原始碼
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preview">預覽</TabsTrigger>
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="text">純文字</TabsTrigger>
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
                      {textContent || '暫無內容'}
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
                使用說明
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">編輯器功能</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• 文字格式化（粗體、斜體、底線）</li>
                    <li>• 多級標題（H1-H6）</li>
                    <li>• 有序和無序列表</li>
                    <li>• 連結插入和編輯</li>
                    <li>• 引用區塊和程式碼</li>
                    <li>• 表格插入和編輯</li>
                    <li>• 文字對齊和縮排</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">進階功能</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• 自動儲存（可設定間隔）</li>
                    <li>• 即時字數和字元統計</li>
                    <li>• HTML 內容清理和驗證</li>
                    <li>• 響應式設計和暗色主題</li>
                    <li>• 內容長度限制和警告</li>
                    <li>• 快捷鍵支援</li>
                    <li>• 無障礙功能</li>
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