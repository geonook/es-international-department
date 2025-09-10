'use client'

/**
 * 格式測試頁面
 * 用於測試 Markdown 轉 HTML 功能
 */

import { useState } from 'react'
import { sanitizeAnnouncementContent } from '@/lib/sanitize-html'

const testContent = `
1. **Item Title** - Description**Important Announcement**

Dear Teachers,

**Summary**: Brief overview of the announcement

**Key Points**:
- Main point with important details
- **Action Required**: Specific steps teachers need to take
- **Deadline**: [Date] - Submit materials by this date

**Resources**:
- [Document Link](https://docs.google.com/example) - Reference materials
- [Form Link](https://forms.google.com/example) - Required submission

Contact [Name] for questions.`

export default function TestFormatPage() {
  const [content] = useState(testContent)
  const processedContent = sanitizeAnnouncementContent(content)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">格式轉換測試頁面</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* 原始 Markdown */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">原始 Markdown 內容</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
              {content}
            </pre>
          </div>
          
          {/* 轉換後的 HTML */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">轉換後的 HTML</h2>
            <div className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              <code className="whitespace-pre-wrap break-all">
                {processedContent}
              </code>
            </div>
          </div>
        </div>
        
        {/* 渲染效果 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">最終渲染效果</h2>
          <div className="border-2 border-gray-200 p-6 rounded-lg">
            <div 
              className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </div>
        </div>
        
        {/* 調試資訊 */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">調試資訊</h2>
          <p className="text-sm text-yellow-700">
            請打開瀏覽器開發者工具的 Console 查看詳細的轉換過程資訊。
          </p>
          <div className="mt-4 text-sm">
            <p><strong>環境:</strong> {typeof window !== 'undefined' ? '客戶端' : '服務端'}</p>
            <p><strong>HTML 長度:</strong> {processedContent.length} 字符</p>
            <p><strong>包含 strong 標籤:</strong> {processedContent.includes('<strong>') ? '是' : '否'}</p>
            <p><strong>包含 ol 標籤:</strong> {processedContent.includes('<ol>') ? '是' : '否'}</p>
            <p><strong>包含 li 標籤:</strong> {processedContent.includes('<li>') ? '是' : '否'}</p>
          </div>
        </div>
        
        {/* 返回首頁 */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首頁
          </a>
        </div>
      </div>
    </div>
  )
}